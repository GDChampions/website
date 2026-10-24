import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { API_BASE } from "../../../config";
import { cn } from "../../../utils/cn";

type MassWhitelistResponse = {
    message: string;
    rowCount: number;
    data: { AccountID: number | null }[];
};

const buttonClass = "border border-base-text/15 bg-base-dark px-4 py-2 cursor-pointer text-sm font-medium text-base-text transition hover:bg-base-text/10 disabled:cursor-not-allowed disabled:opacity-50";

function accounts(count: number) {
    return `${String(count)} account${count === 1 ? "" : "s"}`;
}

function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : "An unexpected error occurred.";
}

// some routes reply with plain text instead of using an error thing.
async function readError(res: Response) {
    try {
        const data = await res.json() as { error?: string };
        return data.error ?? `HTTP ${String(res.status)}`;
    } catch {
        return `HTTP ${String(res.status)}`;
    }
}

async function fetchWhitelist() {
    const res = await fetch(`${API_BASE}/whitelist`, {
        method: "GET",
        credentials: "include",
    });

    if (!res.ok) throw new Error(await readError(res));
    return await res.json() as number[];
}

// the server only reads the AccountID column, so count said rows to preview what uploading will do.
function countAccountIDs(csv: string) {
    const [header = "", ...rows] = csv.trim().split(/\r?\n/);
    const column = header.split(",").map((name) => name.trim()).indexOf("AccountID");
    if (column === -1) return null;

    return rows.filter((row) => Number(row.split(",")[column]) > 0).length;
}

export default function Whitelist() {
    const [accountIDs, setAccountIDs] = useState<number[]>([]);
    const [accountID, setAccountID] = useState("");

    const fileInput = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<{ file: File; count: number } | null>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchWhitelist()
            .then(setAccountIDs)
            .catch((error: unknown) => toast.error(`Failed to load the whitelist: ${errorMessage(error)}`));
    }, []);

    async function refreshWhitelist() {
        try {
            setAccountIDs(await fetchWhitelist());
        } catch (error) {
            toast.error(`Failed to load the whitelist: ${errorMessage(error)}`);
        }
    }

    async function whitelistAccount() {
        const input = accountID.trim();
        if (!/^\d+$/.test(input) || Number(input) === 0) {
            toast.error("Enter a valid GD account ID.");
            return;
        }

        const id = Number(input);
        if (accountIDs.includes(id)) {
            toast.info(`Account ${input} is already whitelisted.`);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/whitelist`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ accountID: id }),
            });

            if (!res.ok) throw new Error(await readError(res));

            setAccountIDs((prev) => [...prev, id]);
            setAccountID("");
            toast.success(`Account ${input} has been whitelisted.`);
        } catch (error) {
            toast.error(`Failed to whitelist account: ${errorMessage(error)}`);
        }
    }

    async function chooseFile(chosen: File | undefined) {
        if (!chosen) return;

        if (!chosen.name.toLowerCase().endsWith(".csv")) {
            toast.error("Only .csv files can be uploaded.");
            return;
        }

        const count = countAccountIDs(await chosen.text());
        if (count === null) {
            toast.error(`${chosen.name} has no AccountID column.`);
            return;
        }
        if (count === 0) {
            toast.error(`${chosen.name} has no account IDs in it.`);
            return;
        }

        setFile({ file: chosen, count });
    }

    async function uploadFile() {
        if (!file) return;
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file.file);

            const res = await fetch(`${API_BASE}/whitelist/mass`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!res.ok) throw new Error(await readError(res));

            const result = await res.json() as MassWhitelistResponse;
            const imported = result.data.filter((row) => row.AccountID).length;

            toast.success(`Whitelisted ${accounts(imported)} from ${file.file.name}.`);
            setFile(null);
            await refreshWhitelist();
        } catch (error) {
            toast.error(`Failed to upload whitelist: ${errorMessage(error)}`);
        } finally {
            setUploading(false);
        }
    }

    function toggleSelected(id: number) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (!next.delete(id)) next.add(id);
            return next;
        });
    }

    function stopSelecting() {
        setSelecting(false);
        setSelected(new Set());
    }

    async function removeSelected() {
        const ids = [...selected];

        try {
            const res = await fetch(`${API_BASE}/whitelist`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ accountID: ids }),
            });

            if (!res.ok) throw new Error(await readError(res));

            toast.success(`Removed ${accounts(ids.length)} from the whitelist.`);
        } catch (error) {
            toast.error(`Failed to remove accounts: ${errorMessage(error)}`);
        }

        stopSelecting();
        await refreshWhitelist();
    }

    return (
        <div className="flex flex-col gap-6 font-lexend">
            <h2 className="mt-6 pl-7 text-left text-6xl text-accent-pink">
                Whitelist
            </h2>

            <div className="flex flex-col gap-8 p-6">
                <section className="flex flex-col gap-3">
                    <h3 className="text-xl font-semibold">Whitelist an account</h3>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            void whitelistAccount();
                        }}
                        className="flex flex-row gap-3"
                    >
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="GD account ID..."
                            value={accountID}
                            onChange={(e) => {
                                setAccountID(e.target.value);
                            }}
                            className="border border-base-text/15 bg-base-dark px-4 py-2 outline-none transition focus:border-accent-pink"
                        />
                        <button type="submit" className={buttonClass}>
                            Whitelist
                        </button>
                    </form>
                </section>

                <section className="flex flex-col gap-3">
                    <h3 className="text-xl font-semibold">Mass whitelist</h3>

                    <div className="border border-base-text/10 bg-base-medium p-2">
                        <p className="py-2 text-center text-lg font-bold uppercase">
                            Notice
                        </p>
                        <p className="bg-base-dark p-4 text-base-text/80">
                            Whitelisting is done through sending the GD account IDs of the players you are allowing to play Champions. This file submitter allows you to whitelist many accounts at once, so please use carefully.
                        </p>
                    </div>

                    <input
                        ref={fileInput}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                            void chooseFile(e.target.files?.[0]);
                            e.target.value = "";
                        }}
                    />

                    {file ? (
                        <div className="flex flex-col items-center gap-4 border-2 border-dashed border-accent-pink/50 px-6 py-12 text-center">
                            <div>
                                <p className="text-xl font-semibold">{file.file.name}</p>
                                <p className="mt-1 text-base-text/70">
                                    This will whitelist <span className="font-semibold text-accent-pink">{accounts(file.count)}</span>.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => void uploadFile()}
                                    disabled={uploading}
                                    className="cursor-pointer bg-accent-pink px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {uploading ? "Uploading..." : "Confirm upload"}
                                </button>
                                <button
                                    onClick={() => {
                                        setFile(null);
                                    }}
                                    disabled={uploading}
                                    className={buttonClass}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => {
                                fileInput.current?.click();
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => {
                                setDragging(false);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragging(false);
                                void chooseFile(e.dataTransfer.files[0]);
                            }}
                            className={cn(
                                "flex cursor-pointer flex-col items-center gap-1 border-2 border-dashed px-6 py-12 text-center transition [&>*]:pointer-events-none",
                                dragging
                                    ? "border-accent-pink bg-accent-pink/5"
                                    : "border-base-text/15 hover:border-base-text/30"
                            )}
                        >
                            <p className="text-xl font-semibold text-base-text/80">
                                Drag your whitelist CSV here
                            </p>
                            <p className="text-sm text-base-text/60">
                                or click to choose a file
                            </p>
                            <p className="mt-4 text-sm text-base-text/40">
                                Needs an AccountID column, e.g. DiscordID,GDAccount,AccountID,ExtraNotes
                            </p>
                        </div>
                    )}
                </section>

                <section className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xl font-semibold">
                            Whitelisted accounts ({accountIDs.length})
                        </h3>

                        {selecting ? (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        setSelected(new Set(accountIDs));
                                    }}
                                    className={buttonClass}
                                >
                                    Select all
                                </button>
                                <button
                                    onClick={() => void removeSelected()}
                                    disabled={selected.size === 0}
                                    className="cursor-pointer border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Remove selected ({selected.size})
                                </button>
                                <button onClick={stopSelecting} className={buttonClass}>
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setSelecting(true);
                                }}
                                disabled={accountIDs.length === 0}
                                className={buttonClass}
                            >
                                Select
                            </button>
                        )}
                    </div>

                    {accountIDs.length === 0 ? (
                        <p className="text-base-text/60">
                            The whitelist is empty, so anyone can currently play Champions.
                        </p>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-2">
                            {accountIDs.map((id) => (
                                <label
                                    key={id}
                                    className={cn(
                                        "flex items-center gap-3 border border-base-text/10 bg-base-medium px-4 py-3 font-semibold transition",
                                        selecting && "cursor-pointer hover:border-base-text/30",
                                        selected.has(id) && "border-accent-pink/60"
                                    )}
                                >
                                    {selecting && (
                                        <input
                                            type="checkbox"
                                            checked={selected.has(id)}
                                            onChange={() => {
                                                toggleSelected(id);
                                            }}
                                            className="size-4 cursor-pointer accent-accent-pink"
                                        />
                                    )}
                                    {id}
                                </label>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
