"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Pencil, Trash2, PlusCircle, X } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Room } from "@/lib/types";
import { getApiErrorMessage, hotelApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

type FormValues = {
  title: string;
  price: string;
  capacity: string;
  images: string;
  amenities: string;
  description: string;
  active: boolean;
};

function RoomForm({
  defaultValues,
  onSubmit,
  busy,
  submitLabel,
  onCancel
}: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  busy: boolean;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { active: true, ...defaultValues }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 md:grid-cols-2">
      <div className="md:col-span-2">
        <Input placeholder="Room title *" {...register("title", { required: "Title required" })} />
        {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
      </div>
      <div>
        <Input placeholder="Price (USD per night) *" type="number" step="0.01" {...register("price", { required: "Price required" })} />
        {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price.message}</p>}
      </div>
      <div>
        <Input placeholder="Max capacity *" type="number" {...register("capacity", { required: "Capacity required" })} />
        {errors.capacity && <p className="mt-1 text-xs text-red-400">{errors.capacity.message}</p>}
      </div>
      <div className="md:col-span-2">
        <Input placeholder="Amenities (comma separated: WiFi, Pool, Spa…) *" {...register("amenities", { required: "Amenities required" })} />
      </div>
      <Textarea
        placeholder="Image URLs — one per line or comma separated *"
        rows={3}
        className="md:col-span-2"
        {...register("images", { required: "At least one image required" })}
      />
      <Textarea
        placeholder="Description (min 20 characters) *"
        rows={4}
        className="md:col-span-2"
        {...register("description", { required: "Description required" })}
      />
      <div className="flex items-center gap-2 md:col-span-2">
        <input type="checkbox" id="active" {...register("active")} className="accent-gold" />
        <label htmlFor="active" className="text-sm text-white/70">Active (visible to guests)</label>
      </div>
      <div className="flex gap-2 md:col-span-2">
        <Button type="submit" disabled={busy} className="flex-1">
          {busy ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export default function AdminRoomsPage() {
  const { ready } = useAdminAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    try {
      const data = await hotelApi.getRooms();
      setRooms(data);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to load rooms"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (ready) load(); }, [ready]);

  const onCreateSubmit = async (data: FormValues) => {
    setBusy(true);
    try {
      await hotelApi.createRoom({
        title: data.title,
        description: data.description,
        price: Number(data.price),
        capacity: Number(data.capacity),
        images: data.images.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean),
        amenities: data.amenities.split(",").map((s) => s.trim()).filter(Boolean),
        active: data.active
      });
      toast.success("Room created successfully");
      setShowCreate(false);
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to create room"));
    } finally {
      setBusy(false);
    }
  };

  const onEditSubmit = async (data: FormValues) => {
    if (!editing) return;
    setBusy(true);
    try {
      await hotelApi.updateRoom(editing.id, {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        capacity: Number(data.capacity),
        images: data.images.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean),
        amenities: data.amenities.split(",").map((s) => s.trim()).filter(Boolean),
        active: data.active
      });
      toast.success("Room updated successfully");
      setEditing(null);
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to update room"));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? All bookings for this room will also be removed.`)) return;
    try {
      await hotelApi.deleteRoom(id);
      toast.success(`"${title}" deleted`);
      load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to delete room"));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl">Manage Rooms</h1>
          <p className="mt-1 text-sm text-white/50">{rooms.length} room{rooms.length !== 1 ? "s" : ""} total</p>
        </div>
        <Button onClick={() => { setShowCreate((p) => !p); setEditing(null); }}>
          <PlusCircle size={15} className="mr-2" />
          {showCreate ? "Cancel" : "Add Room"}
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="glass mt-6 rounded-2xl p-5">
          <h2 className="mb-4 font-heading text-xl text-gold">New Room</h2>
          <RoomForm onSubmit={onCreateSubmit} busy={busy} submitLabel="Create Room" onCancel={() => setShowCreate(false)} />
        </div>
      )}

      {/* Room list */}
      <div className="mt-6 space-y-3">
        {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}

        {!loading && rooms.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-white/50">No rooms yet. Add one above.</div>
        )}

        {rooms.map((room) => (
          <div key={room.id}>
            <div className="glass flex items-center justify-between gap-4 rounded-xl p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{room.title}</p>
                  {!room.active && (
                    <span className="rounded-full border border-yellow-500/40 px-2 py-0.5 text-xs text-yellow-400">Hidden</span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-white/55">
                  ${Number(room.price).toLocaleString()} / night · {room.capacity} guests · {room.amenities.length} amenities · {room.images.length} image{room.images.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="ghost"
                  onClick={() => { setEditing(room); setShowCreate(false); }}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Pencil size={13} /> Edit
                </Button>
                <Button
                  variant="dark"
                  onClick={() => onDelete(room.id, room.title)}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Trash2 size={13} /> Delete
                </Button>
              </div>
            </div>

            {/* Inline edit panel */}
            {editing?.id === room.id && (
              <div className="glass mt-1 rounded-2xl border-t-0 rounded-t-none p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-heading text-xl text-gold">Edit: {room.title}</h2>
                  <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <RoomForm
                  defaultValues={{
                    title: room.title,
                    price: String(room.price),
                    capacity: String(room.capacity),
                    images: room.images.join("\n"),
                    amenities: room.amenities.join(", "),
                    description: room.description,
                    active: room.active ?? true
                  }}
                  onSubmit={onEditSubmit}
                  busy={busy}
                  submitLabel="Save Changes"
                  onCancel={() => setEditing(null)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
