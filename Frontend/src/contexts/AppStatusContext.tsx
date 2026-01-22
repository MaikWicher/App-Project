import React, { createContext, useContext, useState, type ReactNode } from "react";

interface AppStatusContextType {
    status: string;
    progress: number; // 0 to 100
    isLoading: boolean;
    setStatus: (status: string) => void;
    setProgress: (progress: number) => void;
    setLoading: (loading: boolean) => void;
}

const AppStatusContext = createContext<AppStatusContextType | undefined>(undefined);

export const AppStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState("status.ready");
    const [progress, setProgress] = useState(0);
    const [isLoading, setLoading] = useState(false);

    return (
        <AppStatusContext.Provider
            value={{
                status,
                progress,
                isLoading,
                setStatus,
                setProgress,
                setLoading
            }}
        >
            {children}
        </AppStatusContext.Provider>
    );
};

export const useAppStatus = (): AppStatusContextType => {
    const context = useContext(AppStatusContext);
    if (!context) {
        throw new Error("useAppStatus must be used within an AppStatusProvider");
    }
    return context;
};
