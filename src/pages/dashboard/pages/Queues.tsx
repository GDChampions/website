import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { QueueOptions } from "../types";
import { API_BASE } from "../../../config";
import { cn } from "../../../utils/cn";

type OptionKey = Exclude<keyof QueueOptions, "qid">;
type Draft = Partial<Record<OptionKey, string>>;

const buttonClass = "border border-base-text/15 bg-base-dark px-4 py-2 cursor-pointer text-sm font-medium text-base-text transition hover:bg-base-text/10 disabled:cursor-not-allowed disabled:opacity-50";
const inputClass = "border border-base-text/15 bg-base-dark px-4 py-2 text-base-text outline-none transition focus:border-accent-pink";

// ames of the queue buttons in the client (I think this is right hopefully).
const queueNames: Partial<Record<string, string>> = {
    "lr.nd": "Harder | Insane",
    "lr.ld": "Easy Demon | Medium Demon",
    "lr.md": "Hard Demon | Insane Demon",
    "lr.hd": "Extreme Demon",
    "lr.ranked": "Competitive",
};

// difficulty IDs used by the level API. 7 is not here, thanks gsv api for that lol.
const difficulties: Record<number, string> = {
    2: "Easy",
    3: "Normal",
    4: "Hard",
    5: "Harder",
    6: "Insane",
    8: "Easy Demon",
    9: "Medium Demon",
    10: "Hard Demon",
    11: "Insane Demon",
    12: "Extreme Demon",
};

const fieldLabels: Record<OptionKey, string> = {
    matchSize: "Players per match",
    difficultyMin: "Min difficulty",
    difficultyMax: "Max difficulty",
    startingMargin: "Starting margin",
    marginIncrement: "Margin increment",
    maxMargin: "Max margin",
};

const unrankedFields: OptionKey[] = ["matchSize", "difficultyMin", "difficultyMax"];
const rankedFields: OptionKey[] = ["matchSize", "startingMargin", "marginIncrement", "maxMargin"];

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

async function fetchQueues() {
    const res = await fetch(`${API_BASE}/queues`, {
        method: "GET",
        credentials: "include",
    });

    if (!res.ok) throw new Error(await readError(res));
    const data = await res.json() as Record<string, QueueOptions>;
    return Object.values(data);
}

// the unranked queues use the difficulty range.
function isRanked(queue: QueueOptions) {
    return queue.difficultyMin === undefined;
}

function queueFields(queue: QueueOptions) {
    return isRanked(queue) ? rankedFields : unrankedFields;
}

function toDraft(queue: QueueOptions) {
    const draft: Draft = {};
    for (const key of queueFields(queue)) draft[key] = String(queue[key] ?? "");
    return draft;
}

// the server saves whatever is given, so check that nothing breaks matchmaking.
function optionsError(queue: QueueOptions) {
    if (!Number.isInteger(queue.matchSize) || queue.matchSize < 1) {
        return "Players per match must be a whole number of at least 1.";
    }

    if (isRanked(queue)) {
        const { startingMargin = NaN, marginIncrement = NaN, maxMargin = NaN } = queue;
        if (![startingMargin, marginIncrement, maxMargin].every((margin) => margin >= 0 && margin <= 1)) {
            return "Margins must be between 0 and 1.";
        }
        if (startingMargin > maxMargin) return "The starting margin can't be more than the max margin.";
    } else if ((queue.difficultyMin ?? 0) > (queue.difficultyMax ?? 0)) {
        return "The min difficulty can't be harder than the max difficulty.";
    }

    return null;
}

function QueueCard({ queue, onSaved }: { queue: QueueOptions; onSaved: () => Promise<void> }) {
    const fields = queueFields(queue);
    const [draft, setDraft] = useState(() => toDraft(queue));
    const changed = fields.some((key) => draft[key] !== String(queue[key] ?? ""));

    async function save() {
        const options: QueueOptions = { ...queue };
        for (const key of fields) {
            const value = draft[key]?.trim() ?? "";
            if (value === "") {
                toast.error(`Fill in the ${fieldLabels[key].toLowerCase()}.`);
                return;
            }
            options[key] = Number(value);
        }

        const optionError = optionsError(options);
        if (optionError) {
            toast.error(optionError);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/queues/${queue.qid}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ options }),
            });

            if (!res.ok) throw new Error(await readError(res));

            toast.success(`${queue.qid} has been updated.`);
            await onSaved();
        } catch (error) {
            toast.error(`Failed to update ${queue.qid}: ${errorMessage(error)}`);
        }
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                void save();
            }}
            className="flex flex-col gap-4 border border-base-text/10 bg-base-medium p-5"
        >
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex items-center justify-center bg-accent-pink/15 px-3 py-3 text-sm font-bold text-accent-pink">
                    {queue.qid}
                </div>
                <p className="truncate text-lg font-semibold text-base-text">
                    {queueNames[queue.qid] ?? queue.qid}
                </p>
            </div>

            <div className="flex flex-row flex-wrap items-end gap-3">
                {fields.map((key) => (
                    <label key={key} className="flex w-44 flex-col gap-1 text-sm text-base-text/70">
                        {fieldLabels[key]}
                        {key === "difficultyMin" || key === "difficultyMax" ? (
                            <select
                                value={draft[key]}
                                onChange={(e) => {
                                    setDraft({ ...draft, [key]: e.target.value });
                                }}
                                className={cn(inputClass, "cursor-pointer")}
                            >
                                {Object.entries(difficulties).map(([id, name]) => (
                                    <option key={id} value={id}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                inputMode={key === "matchSize" ? "numeric" : "decimal"}
                                value={draft[key]}
                                onChange={(e) => {
                                    setDraft({ ...draft, [key]: e.target.value });
                                }}
                                className={inputClass}
                            />
                        )}
                    </label>
                ))}

                <button type="submit" disabled={!changed} className={buttonClass}>
                    Save
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setDraft(toDraft(queue));
                    }}
                    disabled={!changed}
                    className={buttonClass}
                >
                    Reset
                </button>
            </div>
        </form>
    );
}

export default function Queues() {
    const [queues, setQueues] = useState<QueueOptions[]>([]);

    useEffect(() => {
        fetchQueues()
            .then(setQueues)
            .catch((error: unknown) => toast.error(`Failed to load queues: ${errorMessage(error)}`));
    }, []);

    async function refreshQueues() {
        try {
            setQueues(await fetchQueues());
        } catch (error) {
            toast.error(`Failed to load queues: ${errorMessage(error)}`);
        }
    }

    const unranked = queues.filter((queue) => !isRanked(queue));
    const ranked = queues.filter(isRanked);

    return (
        <div className="flex flex-col gap-6 font-lexend">
            <h2 className="mt-6 pl-7 text-left text-6xl text-accent-pink">
                Queues
            </h2>

            <div className="flex flex-col gap-8 p-6">
                {queues.length === 0 ? (
                    <p className="text-base-text/60">
                        No queues found.
                    </p>
                ) : (
                    <>
                        <section className="flex flex-col gap-3">
                            <h3 className="text-xl font-semibold">Unranked queues ({unranked.length})</h3>

                            {unranked.map((queue) => (
                                <QueueCard key={queue.qid} queue={queue} onSaved={refreshQueues} />
                            ))}
                        </section>

                        <section className="flex flex-col gap-3">
                            <h3 className="text-xl font-semibold">Ranked queues ({ranked.length})</h3>
                            <div className="flex flex-col gap-1 text-sm text-base-text/60">
                                <p>
                                    Players get matched when their ranks are within the margin of each other.
                                </p>
                                <p>
                                    The margin starts at the starting margin and grows by the margin increment every 5 seconds a player waits, up to the max margin.
                                </p>
                            </div>

                            {ranked.map((queue) => (
                                <QueueCard key={queue.qid} queue={queue} onSaved={refreshQueues} />
                            ))}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
