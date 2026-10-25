
import { NavLink, Outlet } from "react-router";

function SidebarItem({ text, to }: { text: string; to: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `mx-2 my-2 border-l-2 px-4 py-3 text-left transition ${
                    isActive
                        ? "border-accent-pink bg-base-dark text-accent-pink"
                        : "border-transparent text-base-text/70 hover:bg-base-dark hover:text-base-text"
                }`
            }
        >
            {text}
        </NavLink>
    );
}

function Dashboard() {
    return (
        <div className="flex h-full w-full bg-base-dark font-lexend text-base-text">
            <main className="flex h-full w-full gap-0">
                <aside className="flex w-56 shrink-0 flex-col border-r border-base-text/10 bg-base-medium py-4">
                    <SidebarItem
                        text="Whitelist"
                        to="/dashboard/whitelist"
                    />

                    <SidebarItem
                        text="Build IDs"
                        to="/dashboard/build"
                    />

                    <SidebarItem
                        text="Users"
                        to="/dashboard/users"
                    />
                </aside>

                <section className="min-w-0 flex-1 overflow-y-auto bg-base-dark">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}

export default Dashboard;
