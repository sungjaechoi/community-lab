"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type AuthUser = { id: string; displayName: string };
type Session = { status: "loading" | "guest" | "error"; user?: never } | { status: "authenticated"; user: AuthUser };
type AuthContextValue = {
  session: Session; expired: boolean; signingOut: boolean; signOutError: string;
  refresh: () => Promise<void>; signOut: () => Promise<boolean>;
};
const AuthContext = createContext<AuthContextValue | null>(null);
const changeKey = "community-lab-auth-change";
const loginKey = "community-lab-auth-login";

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session>({ status: "loading" });
  const [expired, setExpired] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const lastIdentity = useRef<string | null>(null);
  const hadUser = useRef(false);
  const sequence = useRef(0);
  const request = useRef<AbortController | null>(null);
  const leaving = useRef(false);
  const invalidate = useCallback(() => {
    ++sequence.current; request.current?.abort(); request.current = null;
  }, []);

  const refresh = useCallback(async () => {
    if (leaving.current) return;
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    const current = ++sequence.current;
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store", signal: controller.signal });
      if (current !== sequence.current) return;
      if (response.status === 401) {
        const lostSession = hadUser.current;
        setExpired((previous) => previous || lostSession); hadUser.current = false;
        setSession({ status: "guest" }); return;
      }
      if (!response.ok) throw new Error("SESSION_UNAVAILABLE");
      const data = await response.json();
      if (current !== sequence.current) return;
      if (typeof data.user?.id !== "string" || typeof data.user?.displayName !== "string") throw new Error("INVALID_SESSION");
      if (lastIdentity.current !== data.user.id) {
        lastIdentity.current = data.user.id;
        try { localStorage.setItem(loginKey, String(Date.now())); } catch { /* Focus also revalidates. */ }
      }
      hadUser.current = true; setExpired(false);
      setSession({ status: "authenticated", user: { id: data.user.id, displayName: data.user.displayName } });
    } catch {
      // Aborted older responses must never replace the newest login/logout state.
      if (current === sequence.current) setSession({ status: "error" });
    } finally { clearTimeout(timeout); if (current === sequence.current) request.current = null; }
  }, []);

  useEffect(() => {
    void refresh();
    const visible = () => { if (document.visibilityState === "visible" && !request.current) void refresh(); };
    const changed = (event: StorageEvent) => {
      if (event.key === loginKey) { void refresh(); return; }
      if (event.key === changeKey) {
        invalidate();
        hadUser.current = false; setExpired(true); setSession({ status: "guest" });
        lastIdentity.current = null;
        void refresh();
      }
    };
    window.addEventListener("focus", visible);
    window.addEventListener("online", visible);
    window.addEventListener("pageshow", visible);
    window.addEventListener("storage", changed);
    document.addEventListener("visibilitychange", visible);
    return () => {
      invalidate();
      window.removeEventListener("focus", visible);
      window.removeEventListener("online", visible);
      window.removeEventListener("pageshow", visible);
      window.removeEventListener("storage", changed);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [pathname, refresh, invalidate]);

  const signOut = useCallback(async () => {
    if (leaving.current) return false;
    leaving.current = true; setSigningOut(true); setSignOutError("");
    invalidate();
    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST", signal: AbortSignal.timeout(10_000) });
      if (response.status !== 204) throw new Error("SIGN_OUT_FAILED");
      hadUser.current = false; setExpired(false); setSession({ status: "guest" });
      lastIdentity.current = null;
      // This is only an invalidation signal. No identity, cookie or token is stored.
      try { localStorage.setItem(changeKey, String(Date.now())); } catch { /* Focus also revalidates. */ }
      return true;
    } catch {
      setSignOutError("로그아웃하지 못했어요. 연결을 확인하고 다시 눌러 주세요.");
      return false;
    } finally { leaving.current = false; setSigningOut(false); }
  }, [invalidate]);

  return <AuthContext.Provider value={{ session, expired, signingOut, signOutError, refresh, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AUTH_PROVIDER_REQUIRED");
  return value;
}
