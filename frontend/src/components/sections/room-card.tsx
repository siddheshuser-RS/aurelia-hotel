import Image from "next/image";
import Link from "next/link";
import { Users, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Room } from "@/lib/types";

export function RoomCard({ room }: { room: Room }) {
  const startingFrom = Number(room.price);
  const weekendEstimate = Math.round(startingFrom * 1.14);

  return (
    <Card className="group overflow-hidden p-0 transition duration-500 hover:-translate-y-1.5 hover:border-gold/45">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={room.images[0]}
          alt={room.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-gold/45 bg-black/45 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-gold backdrop-blur">
          <Sparkles size={12} /> Featured
        </div>
      </div>
      <div className="p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Signature Suite</p>
        <h3 className="mt-2 font-heading text-3xl">{room.title}</h3>
        <p className="mt-3 line-clamp-2 text-sm text-white/70">{room.description}</p>
        <div className="mt-4 flex items-center justify-between text-sm text-white/80">
          <span className="flex items-center gap-1">
            <Users size={16} /> {room.capacity} Guests
          </span>
          <span className="font-heading text-xl text-gold">
            ${startingFrom.toLocaleString()}
            <span className="text-sm font-body text-white/50"> / night</span>
          </span>
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-white/50">
          Weekend from ${weekendEstimate.toLocaleString()} / night
        </p>
        <Link href={`/rooms/${room.slug}`} className="mt-5 inline-block text-sm uppercase tracking-[0.15em] text-gold">
          View Details
        </Link>
      </div>
    </Card>
  );
}
