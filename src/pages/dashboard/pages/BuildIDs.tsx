import { API_BASE } from "../../../config"
import { useEffect, useState, useRef } from "react"

export default function BuildIDs() {
    const [builds, setBuilds] = useState<string[]>([])
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [buildsToDelete, setBuildsToDelete] = useState<string[]>([])
    const [errorString, setErrorString] = useState<string>()

    const buildIdInputRef = useRef<HTMLInputElement>(null)

    const getBuilds = async () => {
        const result = await (await fetch(
            `${API_BASE}/allowed-builds/`, {
                method: "GET",
                credentials: "include",
            }
        )).json()
        console.log(result)
        setBuilds(result)
        if (buildIdInputRef.current) {
            buildIdInputRef.current.value = ""
        }
        setIsDeleting(false)
        setBuildsToDelete([])
    }

    const addToBuilds = async () => {
        const result = await fetch(`${API_BASE}/allowed-builds/`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                buildID: buildIdInputRef.current?.value
            })
        })
        if (result.status != 200) {
            setErrorString(await result.text())
        }
        getBuilds()
    }

    const deleteBuilds = async () => {
        const result = await fetch(`${API_BASE}/allowed-builds/`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                buildIDs: buildsToDelete
            })
        })
        if (result.status != 200) {
            setErrorString(await result.text()) 
        }
        getBuilds()
    }

    useEffect(() => {
        getBuilds()
    }, [])

    return <div className="flex flex-col gap-6 font-lexend">
        <h2 className="mt-6 pl-7 text-left text-6xl text-accent-pink">
            Build IDs
        </h2>

        <div className="flex flex-row gap-3 p-6">
            <input
                className="border border-base-text/15 bg-base-dark px-4 py-2"
                type="text"
                placeholder="Build ID..."
                ref={buildIdInputRef}
                onKeyDown={(e) => {
                    if (e.code == "Enter") {
                        addToBuilds()
                    }
                }}
            />
            
            <button
                className="border border-base-text/15 bg-base-dark px-4 py-2 cursor-pointer text-sm font-medium text-base-text transition hover:bg-base-text/10"
                onClick={(_) => addToBuilds()}
            >
                Add to allowed builds
            </button>

            <button
                className="border border-base-text/15 bg-base-dark px-4 py-2 cursor-pointer text-sm font-medium text-base-text transition hover:bg-base-text/10"
                onClick={(_) => setIsDeleting(!isDeleting)}
            >
                {isDeleting ? "Exit deletion mode" : "Enter deletion mode"}
            </button>

            {isDeleting && <button
                className="border border-base-text/15 bg-base-dark px-4 py-2 cursor-pointer text-sm font-medium text-base-text transition hover:bg-base-text/10"
                onClick={(_) => deleteBuilds()}
            >
                Delete builds
            </button>}

            <p>
                {errorString}
            </p>
        </div>

        <div className="flex flex-col gap-3 p-6">
            {builds.map(build => {
                return (
                <div
                    key={build}
                    className="flex flex-col gap-4 border border-base-text/10 bg-base-medium p-5 transition sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex min-w-0 items-center gap-4">
                        {isDeleting &&
                            <input
                                type="checkbox"
                                checked={buildsToDelete.includes(build)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setBuildsToDelete([...buildsToDelete, build])
                                    } else if (!e.target.checked) {
                                        setBuildsToDelete(buildsToDelete.filter((v) => v != build))  
                                    }
                                }}
                            />
                        }
                        <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-base-text">
                                {build}
                            </p>
                        </div>
                    </div>
                </div>
                )
            })}
        </div>
    </div>
}
