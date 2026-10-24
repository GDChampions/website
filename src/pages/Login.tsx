import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { refreshAuth } = useAuth();

    async function login() {
        setError("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:41010/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
                credentials: "include",
            });

            if (!res.ok) {
                setError("Login failed");
                return;
            }

            await refreshAuth();
            navigate("/dashboard");
            window.location.reload();
        } catch (err) {
            console.error(err);
            setError("Could not connect to the authentication server");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-200 items-center justify-center bg-base-dark px-6 font-lexend text-base-text">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    void login();
                }}
                className="flex w-full max-w-md flex-col gap-4 border border-base-text/10 bg-base-medium p-8"
            >
                <div className="mb-4">
                    <h1 className="text-3xl font-bold">Champions</h1>
                    <p className="mt-2 text-base-text/60">
                        Sign in to your account
                    </p>
                </div>

                <label htmlFor="username" className="text-sm font-semibold">
                    Username
                </label>
                <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    className="border border-base-text/10 bg-base-dark px-4 py-3 outline-none transition focus:border-accent-pink"
                />

                <label htmlFor="password" className="text-sm font-semibold">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="border border-base-text/10 bg-base-dark px-4 py-3 outline-none transition focus:border-accent-pink"
                />

                {error && (
                    <p role="alert" className="text-sm text-red-400">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 bg-accent-pink px-4 py-3 font-semibold text-white transition"
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </main>
    );
}