"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!username.trim()) {
      setError("Inserisci un username.");
      return;
    }
    if (password.length < 6) {
      setError("La password deve avere almeno 6 caratteri.");
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: data.user.id, username: username.trim() }]);

      if (profileError) {
        setError("Account creato, ma errore nel profilo: " + profileError.message);
      } else {
        setSuccess("Registrazione completata! Ora puoi accedere.");
        setMode("login");
        setPassword("");
      }
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto mt-12 max-w-md rounded-xl border border-border bg-card p-8 shadow-md">
      {/* Tabs */}
      <div className="mb-6 flex border-b-2 border-border">
        <button
          type="button"
          onClick={() => { setMode("login"); resetMessages(); }}
          className={`flex-1 border-b-2 pb-3 text-sm font-semibold transition-colors ${
            mode === "login"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          } -mb-[2px]`}
        >
          Accedi
        </button>
        <button
          type="button"
          onClick={() => { setMode("register"); resetMessages(); }}
          className={`flex-1 border-b-2 pb-3 text-sm font-semibold transition-colors ${
            mode === "register"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          } -mb-[2px]`}
        >
          Registrati
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 rounded-md bg-danger-light p-3 text-sm text-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-500">
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={mode === "login" ? handleLogin : handleSignUp}>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
        </div>

        {mode === "register" && (
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-foreground">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/15"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-foreground">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Caricamento..." : mode === "login" ? "Accedi" : "Registrati"}
        </button>
      </form>
    </div>
  );
}
