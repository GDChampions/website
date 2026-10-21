import { useEffect, useState } from 'react'
import Whitelist from './pages/Whitelist';
import BuildIDs from './pages/BuildIDs';
import "./dashboard.css"

const AUTH_TOKEN_LOCAL_STORAGE_KEY = "token"

function SidebarItem({ text, callback, isActive }: { text: string, callback: () => void, isActive: boolean }) {
    return (
        <div className={`sidebar-item ${isActive ? "active" : ""}`} onClick={callback}>
            {text}
        </div>
    )
}

function Dashboard() {
    const [activeTab, setActiveTab] = useState("whitelist");
    const [authenticated, setAuthenticated] = useState(false)
    const [token, setToken] = useState("")

    useEffect(() => {
        const storedToken = localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_KEY)
        if (storedToken) {
            (async () => {
                const res = await fetch("http://localhost:41010/verify", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${storedToken}`
                    }
                })
                if (res.status == 200) {
                    setToken(storedToken)
                    setAuthenticated(true)
                }
            })()
        }
    }, [])
    return <div className="dashboard-root">
        <main>
            <p className={authenticated ? "visible" : "hidden"}>
                authenticated
            </p>
            <p className={token ? "visible" : "hidden"}>
                token works
            </p>
            <div className="sidebar">
                <SidebarItem
                    text='Whitelist'
                    callback={() => {
                        setActiveTab("whitelist")
                    }}
                    isActive={activeTab == "whitelist"}
                />
                <SidebarItem
                    text='Build IDs'
                    callback={() => {
                        setActiveTab("build-ids")
                    }}
                    isActive={activeTab == "build-ids"}
                />
                <SidebarItem
                    text='Users'
                    callback={() => {
                        setActiveTab("users")
                    }}
                    isActive={activeTab == "users"}
                />
            </div>
            <div className="content">
                {(() => {
                    switch (activeTab) {
                        case "whitelist": 
                            return <Whitelist />
                        case "build-ids":
                            return <BuildIDs />
                        default:
                            return <p>Unable to find page</p>
                    }
                })()}
            </div>
        </main>
    </div>
}

export default Dashboard
