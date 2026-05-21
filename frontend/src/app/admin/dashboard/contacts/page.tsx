"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MailOpen, Trash2, Mail } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { getApiErrorMessage, hotelApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function AdminContactsPage() {
  const { ready } = useAdminAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await hotelApi.getContacts();
      setContacts(data);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to load contacts"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (ready) load(); }, [ready]);

  const markRead = async (id: string) => {
    try {
      await hotelApi.markContactRead(id);
      setContacts((prev) => prev.map((c) => c.id === id ? { ...c, read: true } : c));
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to update"));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    try {
      await hotelApi.deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to delete"));
    }
  };

  const unread = contacts.filter((c) => !c.read).length;

  return (
    <div>
      <div>
        <h1 className="font-heading text-4xl">Contact Inquiries</h1>
        <p className="mt-1 text-sm text-white/50">
          {contacts.length} total · {unread} unread
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {loading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}

        {!loading && contacts.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-white/50">No inquiries yet.</div>
        )}

        {contacts.map((c) => (
          <div key={c.id} className={`glass rounded-xl p-5 transition ${!c.read ? "border-gold/20" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {!c.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-gold" title="Unread" />
                  )}
                  <p className="font-medium">{c.name}</p>
                  <span className="text-xs text-white/40">&lt;{c.email}&gt;</span>
                  {c.phone && <span className="text-xs text-white/40">{c.phone}</span>}
                </div>
                <p className="mt-1 text-sm font-medium text-gold">{c.subject}</p>
                <p className="mt-2 text-sm text-white/65 line-clamp-3">{c.message}</p>
                <p className="mt-2 text-xs text-white/30">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                {!c.read && (
                  <Button
                    variant="ghost"
                    onClick={() => markRead(c.id)}
                    className="flex items-center gap-1.5 text-xs"
                    title="Mark as read"
                  >
                    <MailOpen size={13} /> Read
                  </Button>
                )}
                {c.read && <Mail size={14} className="mx-auto text-white/20" />}
                <Button
                  variant="dark"
                  onClick={() => onDelete(c.id)}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Trash2 size={13} /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
