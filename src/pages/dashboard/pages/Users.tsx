import { useEffect, useState } from "react"
import type { User } from "../types";


export default function Users() {
    const [users, setUsers] = useState<User[]>([]);

    const iconTypes: Record<number, string> = {
        1: "cube",
        2: "ship",
        3: "jetpack",
        4: "ball",
        5: "ufo",
        6: "wave",
        7: "robot",
        8: "spider",
        9: "swing",
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
            const res = await fetch("http://localhost:41010/users", {
                method: "GET",
                credentials: "include",
            });

            const data: unknown = await res.json();
            setUsers(data as User[]);
        }

        void getUsers();
    }, []);

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
                                <div className="flex size-12 shrink-0 items-center justify-center bg-accent-pink/15 text-lg font-bold text-accent-pink">
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
                                <span
                                    className={`px-3 py-1 text-xs font-semibold ${
                                        perms[user.perms]?.className ?? "bg-purple-500/15 text-purple-400"
                                    }`}
                                >
                                    {perms[user.perms]?.label ?? `(${String(user.perms)})`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
        
    );
}
