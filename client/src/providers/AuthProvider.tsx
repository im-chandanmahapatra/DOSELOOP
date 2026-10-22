import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { API_BASE } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

export interface LocalUserData {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  loginLocal: (userData: LocalUserData) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
  loginLocal: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginLocal = (userData: LocalUserData) => {
    const mockUser: User = {
      id: userData.id || `usr_${Date.now()}`,
      app_metadata: {},
      user_metadata: {
        firstName: userData.firstName,
        lastName: userData.lastName || "",
      },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: userData.email,
    };

    const mockSession: Session = {
      access_token: `local_token_${mockUser.id}`,
      token_type: "bearer",
      expires_in: 3600 * 24 * 7,
      refresh_token: `local_refresh_${mockUser.id}`,
      user: mockUser,
    };

    localStorage.setItem("doseloop_local_user", JSON.stringify(mockUser));
    localStorage.setItem("doseloop_local_session", JSON.stringify(mockSession));
    setSession(mockSession);
    setUser(mockUser);
    setIsLoading(false);
  };

  useEffect(() => {
    // 1. Check local session first
    const savedLocalSession = localStorage.getItem("doseloop_local_session");
    if (savedLocalSession) {
      try {
        const parsed = JSON.parse(savedLocalSession) as Session;
        setSession(parsed);
        setUser(parsed.user);
        setIsLoading(false);
      } catch {
        localStorage.removeItem("doseloop_local_session");
      }
    }

    const syncUser = async (currentSession: Session | null) => {
      if (!currentSession) return;
      try {
        await fetch(`${API_BASE}/auth/sync`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.warn("Backend sync skipped or offline:", err);
      }
    };

    // 2. Also check Supabase if available
    supabase.auth
      .getSession()
      .then(({ data: { session: sbSession } }) => {
        if (sbSession) {
          setSession(sbSession);
          setUser(sbSession?.user ?? null);
          syncUser(sbSession);
        }
      })
      .catch((err) => {
        console.warn("Supabase auth check failed (using local mode):", err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, sbSession) => {
      if (sbSession) {
        setSession(sbSession);
        setUser(sbSession?.user ?? null);
        setIsLoading(false);
        if (event === "SIGNED_IN") {
          trackEvent("login_success");
          syncUser(sbSession);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    trackEvent("logout");
    localStorage.removeItem("doseloop_local_session");
    localStorage.removeItem("doseloop_local_user");
    setSession(null);
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore Supabase network errors on logout
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signOut, loginLocal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
