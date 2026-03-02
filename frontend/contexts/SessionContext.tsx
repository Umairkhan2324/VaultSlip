"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

export type MeState = {
  user_id?: string;
  org_id?: string;
  plan: string;
};

type SessionContextValue = {
  token: string;
  me: MeState;
};

const SessionContext = createContext<SessionContextValue | null>(null);

const defaultMe: MeState = { plan: "free" };

export function SessionProvider({
  token,
  me,
  children,
}: {
  token: string;
  me: MeState;
  children: ReactNode;
}) {
  const value = useMemo<SessionContextValue>(
    () => ({ token, me: { ...defaultMe, ...me } }),
    [token, me?.user_id, me?.org_id, me?.plan]
  );
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}

export function useSessionOptional(): SessionContextValue | null {
  return useContext(SessionContext);
}
