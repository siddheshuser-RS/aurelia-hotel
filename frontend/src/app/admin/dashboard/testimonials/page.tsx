"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { getApiErrorMessage, hotelApi } from "@/lib/api";
import { Testimonial } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type FormValues = { name: string; image: string; rating: string; message: string };

export default function AdminTestimonialsPage() {
  const { ready } = useAdminAuth();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<FormValues>();

  const load = () =>
    hotelApi
      .getTestimonials({ all: true })
      .then(setItems)
      .catch((e) => setError(getApiErrorMessage(e)));

  useEffect(() => {
    if (ready) load();
  }, [ready]);

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      await hotelApi.createTestimonial({
        name: data.name,
        image: data.image,
        rating: Number(data.rating),
        message: data.message
      });
      reset();
      load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const toggleApprove = async (t: Testimonial) => {
    try {
      await hotelApi.updateTestimonial(t.id, { approved: !t.approved });
      load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete testimonial?")) return;
    try {
      await hotelApi.deleteTestimonial(id);
      load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <div>
      <h1 className="font-heading text-4xl">Manage Testimonials</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="glass mt-6 grid gap-3 rounded-2xl p-5">
        <Input placeholder="Name" {...register("name", { required: true })} />
        <Input placeholder="Image URL" {...register("image", { required: true })} />
        <Input placeholder="Rating 1-5" type="number" min={1} max={5} {...register("rating", { required: true })} />
        <Textarea placeholder="Message" rows={3} {...register("message", { required: true })} />
        <Button>Add Testimonial</Button>
      </form>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      <div className="mt-6 space-y-3">
        {items.map((t) => (
          <div key={t.id} className="glass flex items-center justify-between rounded-xl p-4">
            <div>
              <p className="font-medium">
                {t.name}{" "}
                <span className="text-gold">{"★".repeat(t.rating)}</span>
              </p>
              <p className="text-sm text-white/60 line-clamp-1">{t.message}</p>
              <p className="mt-1 text-xs">
                Status:{" "}
                <span className={t.approved ? "text-emerald-300" : "text-yellow-300"}>
                  {t.approved ? "Approved" : "Pending"}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => toggleApprove(t)}>
                {t.approved ? "Unapprove" : "Approve"}
              </Button>
              <Button variant="dark" onClick={() => onDelete(t.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
