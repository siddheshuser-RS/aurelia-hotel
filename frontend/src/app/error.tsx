"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-[#0B0B0B] text-white">
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 text-center px-4">
          <p className="font-heading text-6xl tracking-wide">500</p>
          <p className="font-heading text-2xl text-white/60">An unexpected error occurred</p>
          <p className="text-sm text-white/40">{error.message}</p>
          <div className="flex gap-4">
            <button
              onClick={reset}
              className="rounded-full border border-[#D4AF37]/40 px-7 py-3 text-sm text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition"
            >
              Try again
            </button>
            <Link href="/" className="rounded-full border border-white/15 px-7 py-3 text-sm text-white/60 hover:text-white transition">
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
