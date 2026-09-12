import { useEffect, useState } from "react"

export default function BuildIDs() {
    const [builds, setBuilds] = useState<string[]>([])

    const getBuilds = async () => {
        const result = await (await fetch(
            "http://localhost:41010/get-allowed-builds"
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
