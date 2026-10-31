import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { Season } from "../types";
import { API_BASE } from "../../../config";
import { cn } from "../../../utils/cn";

const buttonClass = "border border-base-text/15 bg-base-dark px-4 py-2 cursor-pointer text-sm font-medium text-base-text transition hover:bg-base-text/10 disabled:cursor-not-allowed disabled:opacity-50";
const inputClass = "border border-base-text/15 bg-base-dark px-4 py-2 text-base-text outline-none scheme-dark transition focus:border-accent-pink";

const statuses = {
    upcoming: { label: "Upcoming", className: "bg-blue-500/15 text-blue-400" },
    active: { label: "Active", className: "bg-accent-pink/15 text-accent-pink" },
    ended: { label: "Ended", className: "bg-base-text/10 text-base-text/70" },
};

function seasons(count: number) {
    return `${String(count)} season${count === 1 ? "" : "s"}`;
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

async function fetchSeasons() {
    const res = await fetch(`${API_BASE}/seasons`, {
        method: "GET",
        credentials: "include",
    });

    if (!res.ok) throw new Error(await readError(res));
    const data = await res.json() as Season[];
    return data.sort((a, b) => a.id - b.id);
}

// the same check that the server uses to find the current season.
function seasonStatus(season: Season, now: number) {
    if (now < Date.parse(season.startTime)) return statuses.upcoming;
    if (now > Date.parse(season.endTime)) return statuses.ended;
    return statuses.active;
}

function formatTime(time: string) {
    return new Date(time).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function Seasons() {
    const [seasonList, setSeasonList] = useState<Season[]>([]);
    const [now] = useState(Date.now);

    const [seasonID, setSeasonID] = useState("");
    const [name, setName] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());

    // season IDs are not auto incremented, so suggest the one after the highest one.
    const nextID = seasonList.length === 0 ? 0 : Math.max(...seasonList.map((season) => season.id)) + 1;

    useEffect(() => {
        fetchSeasons()
            .then(setSeasonList)
            .catch((error: unknown) => toast.error(`Failed to load seasons: ${errorMessage(error)}`));
    }, []);

    async function refreshSeasons() {
        try {
            setSeasonList(await fetchSeasons());
        } catch (error) {
            toast.error(`Failed to load seasons: ${errorMessage(error)}`);
        }
    }

    async function createSeason() {
        const input = seasonID.trim();
        if (input !== "" && !/^\d+$/.test(input)) {
            toast.error("Enter a valid season ID.");
            return;
        }

        const id = input === "" ? nextID : Number(input);
        // creating an existing ID would overwrite.
        if (seasonList.some((season) => season.id === id)) {
            toast.info(`Season ${String(id)} already exists.`);
            return;
        }

        if (!startTime || !endTime) {
            toast.error("Choose a start and end time.");
            return;
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        if (end <= start) {
            toast.error("The end time must be after the start time.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/seasons`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    season: {
                        id,
                        name: name.trim() || undefined,
                        startTime: start.toISOString(),
                        endTime: end.toISOString(),
                    },
                }),
            });

            if (!res.ok) throw new Error(await readError(res));

            setSeasonID("");
            setName("");
            setStartTime("");
            setEndTime("");
            toast.success(`Season ${String(id)} has been created.`);
            await refreshSeasons();
        } catch (error) {
            toast.error(`Failed to create season: ${errorMessage(error)}`);
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
            const res = await fetch(`${API_BASE}/seasons`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ seasons: ids }),
            });

            if (!res.ok) throw new Error(await readError(res));

            toast.success(`Removed ${seasons(ids.length)}.`);
        } catch (error) {
            toast.error(`Failed to remove seasons: ${errorMessage(error)}`);
        }

        stopSelecting();
        await refreshSeasons();
    }

    return (
        <div className="flex flex-col gap-6 font-lexend">
            <h2 className="mt-6 pl-7 text-left text-6xl text-accent-pink">
                Seasons
            </h2>

            <div className="flex flex-col gap-8 p-6">
                <section className="flex flex-col gap-3">
                    <h3 className="text-xl font-semibold">Create a season</h3>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            void createSeason();
                        }}
                        className="flex flex-row flex-wrap items-end gap-3"
                    >
                        <label className="flex w-32 flex-col gap-1 text-sm text-base-text/70">
                            ID
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder={String(nextID)}
                                value={seasonID}
                                onChange={(e) => {
                                    setSeasonID(e.target.value);
                                }}
                                className={inputClass}
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm text-base-text/70">
                            Name
                            <input
                                type="text"
                                placeholder="Season name..."
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                }}
                                className={inputClass}
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm text-base-text/70">
                            Start time
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => {
                                    setStartTime(e.target.value);
                                }}
                                className={inputClass}
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm text-base-text/70">
                            End time
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => {
                                    setEndTime(e.target.value);
                                }}
                                className={inputClass}
                            />
                        </label>
                        <button type="submit" className={buttonClass}>
                            Create season
                        </button>
                    </form>
                </section>

                <section className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xl font-semibold">
                            Seasons ({seasonList.length})
                        </h3>

                        {selecting ? (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        setSelected(new Set(seasonList.map((season) => season.id)));
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
                                disabled={seasonList.length === 0}
                                className={buttonClass}
                            >
                                Select
                            </button>
                        )}
                    </div>

                    {selecting && (
                        <div className="border border-base-text/10 bg-base-medium p-2">
                            <p className="py-2 text-center text-lg font-bold uppercase">
                                Notice
                            </p>
                            <p className="bg-base-dark p-4 text-base-text/80">
                                Removing a season also deletes every player's ranked data for that season, so please use carefully.
                            </p>
                        </div>
                    )}

                    {seasonList.length === 0 ? (
                        <p className="text-base-text/60">
                            There are no seasons yet.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {seasonList.map((season) => {
                                const status = seasonStatus(season, now);

                                return (
                                    <label
                                        key={season.id}
                                        className={cn(
                                            "flex flex-col gap-4 border border-base-text/10 bg-base-medium p-5 transition sm:flex-row sm:items-center sm:justify-between",
                                            selecting && "cursor-pointer hover:border-base-text/30",
                                            selected.has(season.id) && "border-accent-pink/60"
                                        )}
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            {selecting && (
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(season.id)}
                                                    onChange={() => {
                                                        toggleSelected(season.id);
                                                    }}
                                                    className="size-4 cursor-pointer accent-accent-pink"
                                                />
                                            )}

                                            <div className="flex items-center justify-center bg-accent-pink/15 px-3 py-3 text-sm font-bold text-accent-pink">
                                                {season.id}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-lg font-semibold text-base-text">
                                                    {season.name ?? "Unnamed season"}
                                                </p>
                                                <p className="text-sm text-base-text/60">
                                                    {formatTime(season.startTime)} – {formatTime(season.endTime)}
                                                </p>
                                            </div>
                                        </div>

                                        <span className={cn("w-fit px-3 py-1 text-sm font-semibold", status.className)}>
                                            {status.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
