"use client";

import Link from "next/link";

export default function RoomsError({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="section-wrap py-20 text-center">
      <p className="font-heading text-5xl text-white/30">Something went wrong</p>
      <p className="mt-3 text-white/50">{error.message}</p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="rounded-full border border-gold/40 px-6 py-2.5 text-sm text-gold transition hover:bg-gold hover:text-black"
        >
          Try again
        </button>
        <Link href="/" className="text-sm text-white/50 hover:text-gold transition">
          Go home
        </Link>
      </div>
    </section>
  );
}
