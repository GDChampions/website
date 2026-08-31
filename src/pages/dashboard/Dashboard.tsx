import { useState } from 'react'
import Whitelist from './Whitelist';
import BuildIDs from './BuildIDs';
import "./dashboard.css"

function SidebarItem({ text, callback, isActive }: { text: string, callback: () => void, isActive: boolean }) {
    return (
        <div className={`sidebar-item ${isActive ? "active" : ""}`} onClick={callback}>
            {text}
        </div>
    )
}

function Dashboard() {
    const [activeTab, setActiveTab] = useState("whitelist");

    return <div className="dashboard-root">
        <main>
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
