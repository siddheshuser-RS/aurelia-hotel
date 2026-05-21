import type { Metadata } from "next";
import { RoomCard } from "@/components/sections/room-card";
import { hotelApi } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Suites & Residences | Aurelia Hotel",
  description: "Browse our exclusive collection of handcrafted luxury suites with panoramic views, private pools, and world-class amenities."
};

export default async function RoomsPage() {
  const rooms = await hotelApi.getRooms().catch(() => []);

  return (
    <section className="section-wrap py-20">
      <p className="editorial-kicker">Accommodations</p>
      <h1 className="mt-2 max-w-4xl font-heading text-5xl leading-tight md:text-6xl">Luxury Suites & Residences</h1>
      <p className="mt-4 max-w-3xl text-white/70">
        From private-terrace hideaways to panoramic sky residences, every suite is orchestrated with bespoke materials, curated artwork, and anticipatory service.
      </p>
      <div className="mt-6 h-px w-28 bg-gradient-to-r from-gold via-gold/20 to-transparent" />

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </section>
  );
}
