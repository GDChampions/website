import { useEffect, useState } from "react"
import { API_BASE } from "../../../config"

export default function BuildIDs() {
    const [builds, setBuilds] = useState<string[]>([])

    const getBuilds = async () => {
        const result = await (await fetch(
            `${API_BASE}/get-allowed-builds`
        )).json()
        console.log(result)
        setBuilds(result)
    }

    useEffect(() => {
        getBuilds()
    }, [])

    return <div className="build-ids">
        {builds.map(build => {
            return <p>{build}</p>
        })}
    </div>
}
