"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const getErrorMessage = (error: any): string => {
  const msg = error?.message || String(error);
  if (msg.includes("profiles_username_key")) return "Questo username è già in uso.";
  if (msg.includes("Invalid login credentials")) return "Email o password errati.";
  if (msg.includes("User already registered")) return "Esiste già un account con questa email.";
  return msg;
};

export default function LoginForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const resetMessages = () => {
    setFieldErrors({});
    setGeneralError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setGeneralError(getErrorMessage(error));
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    let hasErrors = false;
    const newFieldErrors: Record<string, string> = {};

    if (!username.trim()) {
      newFieldErrors.username = "Inserisci un username.";
      hasErrors = true;
    }
    if (password.length < 6) {
      newFieldErrors.password = "La password deve avere almeno 6 caratteri.";
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setLoading(true);

    // Controllo preventivo: verifichiamo se l'username esiste già prima di creare l'account Auth
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username.trim())
      .maybeSingle();

    if (existingUser) {
      setFieldErrors({ username: "Questo username è già in uso. Scegline un altro." });
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      const msg = getErrorMessage(authError);
      if (msg.toLowerCase().includes("email")) {
        setFieldErrors({ email: msg });
      } else {
        setGeneralError(msg);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: data.user.id, username: username.trim() }]);

      if (profileError) {
        const msg = getErrorMessage(profileError);
        if (msg.includes("username")) {
          setFieldErrors({ username: msg });
        } else {
          setGeneralError("Errore nel profilo: " + msg);
        }
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
      {generalError && (
        <div className="mb-4 rounded-md bg-danger-light p-3 text-sm text-danger">
          {generalError}
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
            className={`w-full rounded-md border bg-background px-4 py-3 text-foreground outline-none transition-all focus:ring-3 ${
              fieldErrors.email 
                ? "border-danger focus:border-danger focus:ring-danger/15" 
                : "border-border focus:border-primary focus:ring-primary/15"
            }`}
          />
          {fieldErrors.email && <p className="mt-1 text-sm text-danger">{fieldErrors.email}</p>}
        </div>

        {mode === "register" && (
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-foreground">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`w-full rounded-md border bg-background px-4 py-3 text-foreground outline-none transition-all focus:ring-3 ${
                fieldErrors.username 
                  ? "border-danger focus:border-danger focus:ring-danger/15" 
                  : "border-border focus:border-primary focus:ring-primary/15"
              }`}
            />
            {fieldErrors.username && <p className="mt-1 text-sm text-danger">{fieldErrors.username}</p>}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-foreground">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`w-full rounded-md border bg-background px-4 py-3 text-foreground outline-none transition-all focus:ring-3 ${
              fieldErrors.password 
                ? "border-danger focus:border-danger focus:ring-danger/15" 
                : "border-border focus:border-primary focus:ring-primary/15"
            }`}
          />
          {fieldErrors.password && <p className="mt-1 text-sm text-danger">{fieldErrors.password}</p>}
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
