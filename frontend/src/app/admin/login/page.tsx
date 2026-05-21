"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { getApiErrorMessage, hotelApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { setSession, token } = useAuthStore();

  useEffect(() => {
    if (token) router.replace("/admin/dashboard");
  }, [token, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const data = await hotelApi.login(values);
      setSession(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}`);
      router.push("/admin/dashboard");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Invalid credentials"));
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="glass rounded-3xl p-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10">
          <Lock size={20} className="text-gold" />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Aurelia Admin</p>
        <h1 className="mt-2 font-heading text-4xl">Welcome Back</h1>
        <p className="mt-1 text-sm text-white/50">Sign in to manage your property</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" placeholder="admin@aurelia.local" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>
          <Button className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
