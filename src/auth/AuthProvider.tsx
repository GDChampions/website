
import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";

async function verifySession(): Promise<boolean> {
    try {
        const res = await fetch("http://localhost:41010/verify", {
            method: "POST",
            credentials: "include",
        });

        return res.ok;
    } catch {
        return false;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const refreshAuth = async (): Promise<void> => {
        setLoading(true);

        try {
            setAuthenticated(await verifySession());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        void verifySession().then((result) => {
            if (cancelled) return;

            setAuthenticated(result);
            setLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{ authenticated, loading, refreshAuth }}
        >
            {children}
        </AuthContext.Provider>
    );
}
