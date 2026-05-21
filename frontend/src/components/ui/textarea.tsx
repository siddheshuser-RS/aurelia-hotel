import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-sm text-ivory placeholder:text-white/45 focus:border-gold focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
