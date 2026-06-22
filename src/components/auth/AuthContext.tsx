"use client";

import { createContext, FormEvent, useContext, useEffect, useMemo, useState } from "react";
import { Lock, Phone, Key, Loader2 } from "lucide-react";
import { api, authStore, type AuthUser } from "@/lib/api";
import { fieldClass, labelClass } from "@/constants";

type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedUser = authStore.getUser();
    const token = authStore.getToken();
    if (storedUser && token && !authStore.isTokenExpired(token)) {
      setUser(storedUser);
    } else {
      authStore.clear();
      setUser(null);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener(authStore.authExpiredEvent, handleAuthExpired);
    return () => window.removeEventListener(authStore.authExpiredEvent, handleAuthExpired);
  }, []);

  const login = async (phone: string, otp: string) => {
    const response = await api.post('/admin/login', { phone, otp });
    const result = response.data?.data || response.data;
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
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    if (!phone) {
      setMessage("Please enter your phone number.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await api.post('/auth/whatsapp-otp/send', {
        phone,
        purpose: "admin-login"
      });
      setOtpSent(true);
      setTimer(60);
      setMessage("OTP sent successfully to WhatsApp.");
    } catch (error: any) {
      setMessage(error.response?.data?.message || (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await login(phone, otp);
    } catch (error: any) {
      setMessage(error.response?.data?.message || (error as Error).message);
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
          Sign in using OTP to access the admin control panel.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className={labelClass}>Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                className={`${fieldClass} pl-10`}
                type="tel"
                placeholder="91XXXXXXXXXX"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
                disabled={otpSent}
              />
            </div>
          </div>
          {otpSent && (
            <div>
              <label className={labelClass}>Enter OTP</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  className={`${fieldClass} pl-10`}
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d5af2] py-3 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition-colors hover:bg-[#154dc8] disabled:opacity-75 cursor-pointer"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Send OTP"}
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d5af2] py-3 text-sm font-bold text-white shadow-md shadow-blue-500/10 transition-colors hover:bg-[#154dc8] disabled:opacity-75 cursor-pointer"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
              </button>
              
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || timer > 0}
                className="w-full inline-flex items-center justify-center gap-2 py-1 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="animate-spin" size={12} />}
                {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
              </button>
            </>
          )}
        </div>

        {otpSent && (
          <button 
            type="button" 
            onClick={() => { setOtpSent(false); setOtp(""); setTimer(0); }} 
            className="mt-3 text-center w-full text-xs font-semibold text-slate-500 hover:text-blue-600 underline"
          >
            Change Phone Number
          </button>
        )}

        {message && (
          <p className="mt-4 rounded-lg border border-rose-100 bg-rose-50/50 p-2.5 text-xs font-semibold text-green-600">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
