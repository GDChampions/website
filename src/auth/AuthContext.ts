
import { createContext } from "react";

export type AuthContextType = {
    authenticated: boolean;
    loading: boolean;
    refreshAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);
