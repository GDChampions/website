import { useEffect, useState, type ReactNode } from "react";
import { toast } from "react-toastify";
import type { AllowedMod, BannedMod } from "../types";
import { API_BASE } from "../../../config";
import { cn } from "../../../utils/cn";

type ModList = "allowed" | "banned";

const buttonClass = "border border-base-text/15 bg-base-dark px-4 py-2 cursor-pointer text-sm font-medium text-base-text transition hover:bg-base-text/10 disabled:cursor-not-allowed disabled:opacity-50";
const removeButtonClass = "cursor-pointer border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50";
const inputClass = "border border-base-text/15 bg-base-dark px-4 py-2 text-base-text outline-none transition focus:border-accent-pink";
const labelClass = "flex flex-col gap-1 text-sm text-base-text/70";
const pillClass = "w-fit shrink-0 px-3 py-1 text-sm font-semibold";

// geode mod ID is usually developer.mod-name, so using all lowercase.
const modIDPattern = /^[a-z0-9_-]+\.[a-z0-9_-]+$/;

function modCount(count: number) {
    return `${String(count)} mod${count === 1 ? "" : "s"}`;
}

function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : "An unexpected error occurred.";
}

async function readError(res: Response) {
    try {
        const data = await res.json() as { error?: string };
        return data.error ?? `HTTP ${String(res.status)}`;
    } catch {
        return `HTTP ${String(res.status)}`;
    }
}

async function fetchMods<T extends { modID: string }>(list: ModList) {
    const res = await fetch(`${API_BASE}/mods/${list}`, {
        method: "GET",
        credentials: "include",
    });

    if (!res.ok) throw new Error(await readError(res));
    const data = await res.json() as T[];
    return data.sort((a, b) => a.modID.localeCompare(b.modID));
}

async function addMod(list: ModList, modID: string, body: object) {
    const res = await fetch(`${API_BASE}/mods/${list}/${encodeURIComponent(modID)}`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(await readError(res));
}

async function removeMods(list: ModList, mods: { modID: string; version?: string }[]) {
    const res = await fetch(`${API_BASE}/mods/${list}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ mods }),
    });

    if (!res.ok) throw new Error(await readError(res));
}

// client sends versions without the v, so account for that.
function cleanVersion(version: string) {
    return version.trim().replace(/^v/i, "");
}

function toggle(set: Set<string>, key: string) {
    const next = new Set(set);
    if (!next.delete(key)) next.add(key);
    return next;
}

function SelectControls({ selecting, selectedCount, total, onStart, onSelectAll, onRemove, onCancel }: {
    selecting: boolean;
    selectedCount: number;
    total: number;
    onStart: () => void;
    onSelectAll: () => void;
    onRemove: () => void;
    onCancel: () => void;
}) {
    if (!selecting) {
        return (
            <button onClick={onStart} disabled={total === 0} className={buttonClass}>
                Select
            </button>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            <button onClick={onSelectAll} className={buttonClass}>
                Select all
            </button>
            <button onClick={onRemove} disabled={selectedCount === 0} className={removeButtonClass}>
                Remove selected ({selectedCount})
            </button>
            <button onClick={onCancel} className={buttonClass}>
                Cancel
            </button>
        </div>
    );
}

function ModCard({ selecting, checked, onToggle, children }: {
    selecting: boolean;
    checked: boolean;
    onToggle: () => void;
    children: ReactNode;
}) {
    // label lets whole card toggle checkbox, but would forward clicks to buttons inside.
    // using code from seasons, could probably make component if used again.
    const Card = selecting ? "label" : "div";

    return (
        <Card
            className={cn(
                "flex items-center gap-4 border border-base-text/10 bg-base-medium p-5 transition",
                selecting && "cursor-pointer hover:border-base-text/30",
                checked && "border-accent-pink/60"
            )}
        >
            {selecting && (
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onToggle}
                    className="size-4 shrink-0 cursor-pointer accent-accent-pink"
                />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {children}
            </div>
        </Card>
    );
}

function AllowedMods() {
    const [mods, setMods] = useState<AllowedMod[]>([]);
    const [modID, setModID] = useState("");
    const [version, setVersion] = useState("");
    const [hash, setHash] = useState("");

    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // same mod can be whitelisted for more than one version.
    const modKey = (mod: AllowedMod) => `${mod.modID}@${mod.version}`;

    useEffect(() => {
        fetchMods<AllowedMod>("allowed")
            .then(setMods)
            .catch((error: unknown) => toast.error(`Failed to load the mod whitelist: ${errorMessage(error)}`));
    }, []);

    async function refreshMods() {
        try {
            setMods(await fetchMods<AllowedMod>("allowed"));
        } catch (error) {
            toast.error(`Failed to load the mod whitelist: ${errorMessage(error)}`);
        }
    }

    async function whitelistMod() {
        const id = modID.trim();
        const modVersion = cleanVersion(version);
        const modHash = hash.trim().toLowerCase();

        if (!modIDPattern.test(id)) {
            toast.error("Enter a valid mod ID, e.g. developer.mod-name.");
            return;
        }
        if (!modVersion) {
            toast.error("Enter the mod version.");
            return;
        }
        if (!/^[0-9a-f]{64}$/.test(modHash)) {
            toast.error("The hash must be a 64 character SHA-256 hash.");
            return;
        }
        // whitelisting the same version would overwrite hash.
        if (mods.some((mod) => mod.modID === id && mod.version === modVersion)) {
            toast.info(`${id} v${modVersion} is already whitelisted.`);
            return;
        }

        try {
            await addMod("allowed", id, { version: modVersion, hash: modHash });

            setModID("");
            setVersion("");
            setHash("");
            toast.success(`${id} v${modVersion} has been whitelisted.`);
            await refreshMods();
        } catch (error) {
            toast.error(`Failed to whitelist mod: ${errorMessage(error)}`);
        }
    }

    function stopSelecting() {
        setSelecting(false);
        setSelected(new Set());
    }

    async function removeSelected() {
        const removing = mods
            .filter((mod) => selected.has(modKey(mod)))
            .map(({ modID, version }) => ({ modID, version }));

        try {
            await removeMods("allowed", removing);
            toast.success(`Removed ${modCount(removing.length)} from the whitelist.`);
        } catch (error) {
            toast.error(`Failed to remove mods: ${errorMessage(error)}`);
        }

        stopSelecting();
        await refreshMods();
    }

    return (
        <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">Mod whitelist ({mods.length})</h3>
                <SelectControls
                    selecting={selecting}
                    selectedCount={selected.size}
                    total={mods.length}
                    onStart={() => {
                        setSelecting(true);
                    }}
                    onSelectAll={() => {
                        setSelected(new Set(mods.map(modKey)));
                    }}
                    onRemove={() => void removeSelected()}
                    onCancel={stopSelecting}
                />
            </div>
            <p className="text-sm text-base-text/60">
                The version and hash have to match the player's copy of the mod. The hash is the SHA-256 of the mod's .geode file.
            </p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    void whitelistMod();
                }}
                className="flex flex-row flex-wrap items-end gap-3"
            >
                <label className={labelClass}>
                    Mod ID
                    <input
                        type="text"
                        placeholder="developer.mod-name"
                        value={modID}
                        onChange={(e) => {
                            setModID(e.target.value);
                        }}
                        className={inputClass}
                    />
                </label>
                <label className={cn(labelClass, "w-32")}>
                    Version
                    <input
                        type="text"
                        placeholder="1.0.0"
                        value={version}
                        onChange={(e) => {
                            setVersion(e.target.value);
                        }}
                        className={inputClass}
                    />
                </label>
                <label className={cn(labelClass, "min-w-64 flex-1")}>
                    Hash
                    <input
                        type="text"
                        placeholder="SHA-256 hash..."
                        value={hash}
                        onChange={(e) => {
                            setHash(e.target.value);
                        }}
                        className={cn(inputClass, "font-mono text-sm")}
                    />
                </label>
                <button type="submit" className={buttonClass}>
                    Add to whitelist
                </button>
            </form>

            {mods.length === 0 ? (
                <p className="text-base-text/60">
                    No mods are whitelisted.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {mods.map((mod) => (
                        <ModCard
                            key={modKey(mod)}
                            selecting={selecting}
                            checked={selected.has(modKey(mod))}
                            onToggle={() => {
                                setSelected((prev) => toggle(prev, modKey(mod)));
                            }}
                        >
                            <div className="min-w-0">
                                <p className="truncate text-lg font-semibold text-base-text">
                                    {mod.modID}
                                </p>
                                <p className="truncate font-mono text-xs text-base-text/50" title={mod.hash}>
                                    {mod.hash}
                                </p>
                            </div>
                            <span className={cn(pillClass, "bg-base-text/10 text-base-text/70")}>
                                v{mod.version}
                            </span>
                        </ModCard>
                    ))}
                </div>
            )}
        </section>
    );
}

function BannedMods() {
    const [mods, setMods] = useState<BannedMod[]>([]);
    const [modID, setModID] = useState("");
    const [version, setVersion] = useState("");
    const [options, setOptions] = useState("");

    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const [viewing, setViewing] = useState<BannedMod | null>(null);
    const isViewing = viewing !== null;

    useEffect(() => {
        fetchMods<BannedMod>("banned")
            .then(setMods)
            .catch((error: unknown) => toast.error(`Failed to load the mod blacklist: ${errorMessage(error)}`));
    }, []);

    useEffect(() => {
        if (!isViewing) return;

        // we (yes we) love keyboard inputs again, very cool.

        function closeOnEscape(e: KeyboardEvent) {
            if (e.key === "Escape") setViewing(null);
        }

        window.addEventListener("keydown", closeOnEscape);
        return () => {
            window.removeEventListener("keydown", closeOnEscape);
        };
    }, [isViewing]);

    async function refreshMods() {
        try {
            setMods(await fetchMods<BannedMod>("banned"));
        } catch (error) {
            toast.error(`Failed to load the mod blacklist: ${errorMessage(error)}`);
        }
    }

    async function blacklistMod() {
        const id = modID.trim();
        const modVersion = cleanVersion(version);

        if (!modIDPattern.test(id)) {
            toast.error("Enter a valid mod ID, e.g. developer.mod-name.");
            return;
        }
        // mod can only be blacklisted once, so adding again would overwrite.
        if (mods.some((mod) => mod.modID === id)) {
            toast.info(`${id} is already blacklisted.`);
            return;
        }

        let parsedOptions: unknown = null;
        if (options.trim()) {
            try {
                parsedOptions = JSON.parse(options);
            } catch {
                toast.error("The options must be valid JSON.");
                return;
            }
        }

        try {
            // null version will blacklist every version of said mod.
            await addMod("banned", id, { version: modVersion || null, options: parsedOptions });

            setModID("");
            setVersion("");
            setOptions("");
            toast.success(`${id} has been blacklisted.`);
            await refreshMods();
        } catch (error) {
            toast.error(`Failed to blacklist mod: ${errorMessage(error)}`);
        }
    }

    function stopSelecting() {
        setSelecting(false);
        setSelected(new Set());
    }

    async function removeSelected() {
        const removing = [...selected].map((modID) => ({ modID }));

        try {
            await removeMods("banned", removing);
            toast.success(`Removed ${modCount(removing.length)} from the blacklist.`);
        } catch (error) {
            toast.error(`Failed to remove mods: ${errorMessage(error)}`);
        }

        stopSelecting();
        await refreshMods();
    }

    return (
        <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">Mod blacklist ({mods.length})</h3>
                <SelectControls
                    selecting={selecting}
                    selectedCount={selected.size}
                    total={mods.length}
                    onStart={() => {
                        setSelecting(true);
                    }}
                    onSelectAll={() => {
                        setSelected(new Set(mods.map((mod) => mod.modID)));
                    }}
                    onRemove={() => void removeSelected()}
                    onCancel={stopSelecting}
                />
            </div>
            <p className="text-sm text-base-text/60">
                Leave the version empty to blacklist every version of the mod.
            </p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    void blacklistMod();
                }}
                className="flex flex-row flex-wrap items-end gap-3"
            >
                <label className={labelClass}>
                    Mod ID
                    <input
                        type="text"
                        placeholder="developer.mod-name"
                        value={modID}
                        onChange={(e) => {
                            setModID(e.target.value);
                        }}
                        className={inputClass}
                    />
                </label>
                <label className={cn(labelClass, "w-32")}>
                    Version
                    <input
                        type="text"
                        placeholder="All versions"
                        value={version}
                        onChange={(e) => {
                            setVersion(e.target.value);
                        }}
                        className={inputClass}
                    />
                </label>
                <label className={cn(labelClass, "min-w-64 flex-1")}>
                    Options (JSON)
                    <input
                        type="text"
                        placeholder='{"key": "value"}'
                        value={options}
                        onChange={(e) => {
                            setOptions(e.target.value);
                        }}
                        className={cn(inputClass, "font-mono text-sm")}
                    />
                </label>
                <button type="submit" className={buttonClass}>
                    Add to blacklist
                </button>
            </form>

            {mods.length === 0 ? (
                <p className="text-base-text/60">
                    No mods are blacklisted.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {mods.map((mod) => (
                        <ModCard
                            key={mod.modID}
                            selecting={selecting}
                            checked={selected.has(mod.modID)}
                            onToggle={() => {
                                setSelected((prev) => toggle(prev, mod.modID));
                            }}
                        >
                            <p className="min-w-0 truncate text-lg font-semibold text-base-text">
                                {mod.modID}
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                {mod.options !== null && !selecting && (
                                    <button
                                        onClick={() => {
                                            setViewing(mod);
                                        }}
                                        className={buttonClass}
                                    >
                                        View options
                                    </button>
                                )}
                                {mod.version === null ? (
                                    <span className={cn(pillClass, "bg-red-500/15 text-red-400")}>
                                        All versions
                                    </span>
                                ) : (
                                    <span className={cn(pillClass, "bg-base-text/10 text-base-text/70")}>
                                        v{mod.version}
                                    </span>
                                )}
                            </div>
                        </ModCard>
                    ))}
                </div>
            )}

            {viewing && (
                <div
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setViewing(null);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
                >
                    <div className="flex w-full max-w-2xl flex-col gap-4 border border-base-text/10 bg-base-medium p-6">
                        <h3 className="truncate text-xl font-semibold">{viewing.modID} options</h3>

                        <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap break-all bg-base-dark p-4 font-mono text-sm text-base-text/80">
                            {JSON.stringify(viewing.options, null, 2)}
                        </pre>

                        <button
                            onClick={() => {
                                setViewing(null);
                            }}
                            className={cn(buttonClass, "w-fit")}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

export default function Mods() {
    return (
        <div className="flex flex-col gap-6 font-lexend">
            <h2 className="mt-6 pl-7 text-left text-6xl text-accent-pink">
                Mods
            </h2>

            <div className="flex flex-col gap-8 p-6">
                <AllowedMods />
                <BannedMods />
            </div>
        </div>
    );
}
