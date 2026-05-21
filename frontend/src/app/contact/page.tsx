"use client";
// Note: metadata cannot be exported from client components. Add metadata in a parent server layout if needed.

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { getApiErrorMessage, hotelApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000)
});

type FormValues = z.infer<typeof schema>;

const INFO = [
  { icon: <MapPin size={18} />, label: "Address", value: "Palm Crescent, Dubai, UAE" },
  { icon: <Phone size={18} />, label: "Phone", value: "+971 555 0101" },
  { icon: <Mail size={18} />, label: "Email", value: "hello@aureliahotel.com" },
  { icon: <Clock size={18} />, label: "Concierge Hours", value: "24 hours, 7 days" }
];

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await hotelApi.submitContact(values);
      toast.success("Message sent! Our concierge will respond within 2 hours.");
      reset();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to send message. Please try again."));
    }
  };

  return (
    <section className="section-wrap py-20">
      <p className="text-xs uppercase tracking-[0.35em] text-gold">Get in Touch</p>
      <h1 className="mt-2 font-heading text-6xl">Contact Concierge</h1>
      <p className="mt-3 max-w-2xl text-white/60">
        Our concierge team is available around the clock to assist with reservations, private events, and any special requests.
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-2xl p-7 space-y-4">
          <h2 className="font-heading text-2xl">Send a Message</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Full Name *</Label>
              <Input placeholder="Your name" {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" placeholder="you@email.com" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Phone (optional)</Label>
              <Input type="tel" placeholder="+971..." {...register("phone")} />
            </div>
            <div>
              <Label>Subject *</Label>
              <Input placeholder="Reservation, Event..." {...register("subject")} />
              {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject.message}</p>}
            </div>
          </div>
          <div>
            <Label>Message *</Label>
            <Textarea rows={6} placeholder="How may we assist you?" {...register("message")} />
            {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
          </div>
          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send Message"}
          </Button>
        </form>

        {/* Info sidebar */}
        <div className="space-y-4">
          {INFO.map(({ icon, label, value }) => (
            <div key={label} className="glass flex items-start gap-4 rounded-2xl p-5">
              <span className="mt-0.5 text-gold">{icon}</span>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40">{label}</p>
                <p className="mt-1 text-sm text-white/80">{value}</p>
              </div>
            </div>
          ))}
          <iframe
            title="Aurelia location map"
            className="h-64 w-full rounded-2xl border-0"
            loading="lazy"
            src="https://maps.google.com/maps?q=Dubai%20Palm%20Jumeirah&t=&z=13&ie=UTF8&iwloc=&output=embed"
          />
        </div>
      </div>
    </section>
  );
}

