"use client";

import { createContext, FormEvent, useContext, useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { adminApi, authStore, type AuthUser } from "@/lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedUser = authStore.getUser();
    const token = authStore.getToken();
    setUser(storedUser && token ? storedUser : null);
    setIsReady(true);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await adminApi.login(email, password);
    authStore.setSession(result.accessToken, result.user);
    setUser(result.user);
  };

  const logout = () => {
    authStore.clear();
    setUser(null);
  };

  const value = useMemo(() => ({ user, isReady, login, logout }), [user, isReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await login(email, password);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-12">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50"
      >
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Lock size={22} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Ensis Admin</h1>
        <p className="mt-1.5 text-xs text-slate-400">
          Sign in with your credentials to access the admin control panel.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              className={fieldClass}
              type="email"
              placeholder="admin@ensis.in"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              className={fieldClass}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
        </div>

        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d5af2] py-3 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition-colors hover:bg-[#154dc8] disabled:opacity-75"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
        {message && (
          <p className="mt-4 rounded-lg border border-rose-100 bg-rose-50/50 p-2.5 text-xs font-semibold text-rose-600">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
