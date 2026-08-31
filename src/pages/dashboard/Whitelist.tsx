import { useRef, useState } from "react";
import "./Whitelist.css"

type Response = {
    message: string
    rowCount: number
    data: any
}

export default function Whitelist() {
    const input = useRef<HTMLInputElement>(null);
    const [result, setResult] = useState<Response | null>(null);
    return <>
        <center>
            <h1>Champions Whitelist Manager</h1>
            <p>only for super cool internal people</p>

            <h3>File Upload</h3>
            <input type="file" name="whitelists" ref={input} />
            <button type="button" onClick={async (e) => {
                if (!input.current || !input.current.files || !input.current.files[0]) return

                const file = input.current.files[0]
                let formData = new FormData()
                formData.append("file", file)
                const result = await fetch("https://api.champions.gd/upload", {
                    method: "POST",
                    body: formData
                })
                setResult(await result.json())
            }}>Submit</button>

            {result && <>
                <p>Server responded with: <b>{result.message}</b></p>
                <p>Users updated: <b>{result.rowCount}</b></p>
            </>}
        </center>
    </>
}
