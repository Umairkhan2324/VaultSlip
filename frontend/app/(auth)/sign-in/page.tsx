"use client";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.55),_transparent_60%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.45),_transparent_55%)]" />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:py-10">
        <div className="hidden max-w-md flex-1 flex-col gap-3 pr-8 md:flex">
          <p className="text-sm font-semibold text-emerald-200">VaultSlip</p>
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-50">
            Welcome back to effortless expenses.
          </h1>
          <p className="text-sm text-emerald-100/90">
            Pick up where you left off—your recent batches, flagged receipts, and chat history are
            ready to go.
          </p>
        </div>
        <Card className="w-full max-w-md px-6 py-8 sm:px-8 sm:py-10 bg-white/15 border border-emerald-300/50 shadow-2xl backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-emerald-50">Sign in</h2>
          <p className="mt-1 text-sm text-emerald-100/90">
            Use your email and password to access your workspace.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-emerald-400/60 bg-emerald-900/40 px-3 py-2 text-sm text-emerald-50 placeholder:text-emerald-200/70 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-emerald-400/60 bg-emerald-900/40 px-3 py-2 text-sm text-emerald-50 placeholder:text-emerald-200/70 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
              required
            />
            {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="mt-4 w-full justify-center bg-emerald-500 hover:bg-emerald-400"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-emerald-100/90">
            No account?{" "}
            <Link href="/sign-up" className="font-medium text-emerald-200 hover:text-emerald-100">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
