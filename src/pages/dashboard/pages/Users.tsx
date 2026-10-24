import { useEffect, useState } from "react"
import type { User } from "../types";
import { toast } from 'react-toastify';
import { API_BASE } from "../../../config";

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    // not needed right now apparently
    // const [staffDropdown, setStaffDropdown] = useState<number | null>(null);

    const iconTypes: Record<number, string> = {
        1: "cube",
        2: "ship",
        3: "ball",
        4: "ufo",
        5: "wave",
        6: "robot",
        7: "spider",
        8: "swing",
        9: "jetpack",
    };
    
    const perms: Partial<Record<number, { label: string; className: string }>> = {
        [-3]: { label: "Banned", className: "bg-red-500/15 text-red-400" },
        [-2]: { label: "Competition Banned", className: "bg-red-500/15 text-red-400" },
        [-1]: { label: "Muted", className: "bg-red-500/15 text-red-400" },
        0: { label: "Regular", className: "bg-base-text/10 text-base-text/70" },
        1: { label: "Moderator", className: "bg-blue-500/15 text-blue-400" },
        2: { label: "Gamemaster", className: "bg-accent-orange/15 text-accent-orange" },
        3: { label: "Admin", className: "bg-accent-pink/15 text-accent-pink" },
        4: { label: "Owner", className: "bg-purple-500/15 text-purple-400" },
    };

    useEffect(() => {
        async function getUsers() {
            const res = await fetch(`${API_BASE}/users`, {
                method: "GET",
                credentials: "include",
            });

            const data: unknown = await res.json();
            setUsers(data as User[]);
        }

        void getUsers();
    }, []);

    async function changeRole(username: string, accID: number, role: number) {
        try {
            const res = await fetch(`${API_BASE}/users/${String(accID)}/role`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? `HTTP ${res.status}`);
            }

            setUsers((prev) =>
                prev.map((user) =>
                    user.accID === accID ? { ...user, perms: role } : user
                )
            );
            toast.success(`Role updated successfully. ${username}'s role is now ${perms[role]?.label ?? String(role)}.`);
        } catch (error) {
            toast.error(`Failed to change role: ${error instanceof Error ? error.message : "An unexpected error occurred."}`);
        }
    }

    async function generatePassword(username: string, accID: number) {
        try {
            const res = await fetch(
                `${API_BASE}/users/${String(accID)}/genpass`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? `HTTP ${res.status}`);
            }

            const data: { password: string } = await res.json();

            toast.success(
                <div className="flex flex-col gap-2">
                    <span className="font-semibold">
                        Password generated for {username}
                    </span>
                    <button
                        onClick={() => {
                            void navigator.clipboard.writeText(data.password);
                            toast.info("Password copied to clipboard.");
                        }}
                        className="w-fit bg-accent-pink/15 px-3 py-1 text-sm cursor-pointer text-accent-pink"
                    >
                        Copy password
                    </button>
                </div>,
                { autoClose: false }
            );
        } catch (error) {
            toast.error(
                `Failed to generate password: ${
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred."
                }`
            );
        }
    }

    return (
        <>
            <div className="flex flex-col gap-6 font-lexend">
                <h2 className="mt-6 pl-7 text-left text-6xl text-accent-pink">
                    Users
                </h2>

                <div className="flex flex-col gap-3 p-6">
                    {users.map((user) => (
                        <div
                            key={user.accID}
                            className="flex flex-col gap-4 border border-base-text/10 bg-base-medium p-5 transition sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="flex py-3 items-center justify-center bg-accent-pink/15 px-3 text-sm font-bold text-accent-pink">
                                    {user.accID}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-lg font-semibold text-base-text">
                                        {user.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {user.icons.map((icon, index) => {
                                    const type = iconTypes[index + 1];

                                    if (!type) return null;

                                    const [color1, color2, color3] = user.colors;

                                    const src =
                                        `https://gdicon.oat.zone/icon.png?` +
                                        `type=${encodeURIComponent(type)}` +
                                        `&value=${encodeURIComponent(String(icon))}` +
                                        `&color1=${String(color1)}` +
                                        `&color2=${String(color2)}` +
                                        `&color3=${String(color3)}` +
                                        `&glow=${Number(user.hasGlow)}`;

                                    return (
                                        <div
                                            key={`${type}-${String(icon)}`}
                                            className="flex size-12 items-center justify-center border border-base-text/10 bg-base-dark p-2"
                                            title={`${type}: ${String(icon)}`}
                                        >
                                            <img
                                                src={src}
                                                alt={`${type} ${String(icon)}`}
                                                className="size-full object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => void generatePassword(user.name, user.accID)}
                                    className="border border-base-text/15 bg-base-dark px-4 py-2 cursor-pointer text-sm font-medium text-base-text transition hover:bg-base-text/10"
                                >
                                    Generate password
                                </button>

                                <select
                                    value={user.perms}
                                    onChange={(e) =>
                                        void changeRole(
                                            user.name,
                                            user.accID,
                                            Number(e.target.value)
                                        )
                                    }
                                    className="border border-base-text/15 bg-base-dark px-3 py-2 text-sm text-base-text outline-none cursor-pointer transition focus:border-accent-pink"
                                >
                                    {Object.entries(perms).map(([role, perm]) => (
                                        <option key={role} value={role}>
                                            {perm?.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
        
    );
}
