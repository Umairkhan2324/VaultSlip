"use client";
import { useState } from "react";
import Link from "next/link";
import { getBackendUrl } from "@/lib/api";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(`${getBackendUrl()}/contact/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, company, message }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.detail || "Failed to send");
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="font-semibold shrink-0">VaultSlip</Link>
          <nav className="flex flex-wrap gap-3 sm:gap-4">
            <Link href="/pricing" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">Pricing</Link>
            <Link href="/sign-in" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">Sign in</Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold">Contact Sales</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          For Pro or Enterprise plans, we will get back within 24 hours.
        </p>
        {sent ? (
          <p className="mt-6 text-green-600 dark:text-green-400">Thanks. We will be in touch.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              required
              minLength={2}
              maxLength={100}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              required
            />
            <input
              type="text"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              required
              minLength={2}
            />
            <textarea
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              rows={4}
              maxLength={2000}
              required
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              className="rounded bg-zinc-900 py-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
