import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-white/20 bg-black/30 px-3 text-sm text-ivory placeholder:text-white/45 focus:border-gold focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
