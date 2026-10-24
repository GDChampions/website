import { useState } from 'react'
import Whitelist from './pages/Whitelist';
import BuildIDs from './pages/BuildIDs';
import Users from './pages/Users';

function SidebarItem({ text, callback, isActive }: { text: string, callback: () => void, isActive: boolean }) {
    return (
        <div
            className={`mx-2 my-2 cursor-pointer px-4 py-3 text-left transition ${
                isActive
                    ? "border-l-2 border-accent-pink bg-base-dark text-accent-pink"
                    : "border-l-2 border-transparent text-base-text/70 hover:bg-base-dark hover:text-base-text"
            }`}
            onClick={callback}
        >
            {text}
        </div>
    )
}

function Dashboard() {
    const [activeTab, setActiveTab] = useState("whitelist");

    return (
        <div className="flex h-full w-full bg-base-dark font-lexend text-base-text">
            <main className="flex h-full w-full gap-0">
                <aside className="flex w-56 shrink-0 flex-col border-r border-base-text/10 bg-base-medium py-4">

                    <SidebarItem
                        text="Whitelist"
                        callback={() => setActiveTab("whitelist")}
                        isActive={activeTab === "whitelist"}
                    />

                    <SidebarItem
                        text="Build IDs"
                        callback={() => setActiveTab("build-ids")}
                        isActive={activeTab === "build-ids"}
                    />

                    <SidebarItem
                        text="Users"
                        callback={() => setActiveTab("users")}
                        isActive={activeTab === "users"}
                    />
                </aside>

                <section className="min-w-0 flex-1 overflow-y-auto bg-base-dark">
                    {(() => {
                        switch (activeTab) {
                            case "whitelist":
                                return <Whitelist />;
                            case "build-ids":
                                return <BuildIDs />;
                            case "users":
                                return <Users />;
                            default:
                                return <p className="p-6">Unable to find page</p>;
                        }
                    })()}
                </section>
            </main>
        </div>
    );
}

export default Dashboard
