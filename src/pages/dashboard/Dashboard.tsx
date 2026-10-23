import { useState } from 'react'
import Whitelist from './pages/Whitelist';
import BuildIDs from './pages/BuildIDs';

function SidebarItem({ text, callback, isActive }: { text: string, callback: () => void, isActive: boolean }) {
    return (
        <div
            className={`mx-2 my-2 cursor-pointer select-none rounded-2xl px-6 py-4 ${
                isActive ? "bg-[rgb(65,65,65)]" : "bg-[rgb(50,50,50)]"
            }`}
            onClick={callback}
        >
            {text}
        </div>
    )
}

function Dashboard() {
    const [activeTab, setActiveTab] = useState("whitelist");

    return <div className="flex h-full w-full items-center justify-center bg-[rgb(25,25,25)] text-center font-['Lucida_Sans','Lucida_Sans_Regular','Lucida_Grande','Lucida_Sans_Unicode',Geneva,Verdana,sans-serif] text-white">
        <main className="m-6 flex h-full w-full flex-row items-center justify-around gap-1.25">
            <div className="flex h-[calc(100%-3rem)] w-[10%] flex-col rounded-lg bg-[rgb(35,35,35)]">
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
            <div className="h-[calc(100%-3rem)] w-[90%] rounded-lg bg-[rgb(35,35,35)]">
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
