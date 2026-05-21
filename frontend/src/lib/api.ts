import axios, { AxiosError } from "axios";
import {
  ApiError,
  AuthUser,
  AvailabilityCalendarResponse,
  AvailabilityResponse,
  Booking,
  BookingQuote,
  BookingStatus,
  GalleryCategory,
  GalleryItem,
  LoginResponse,
  MultiRoomBookingPayload,
  MultiRoomBookingResponse,
  Room,
  Testimonial
} from "./types";

function resolveApiBaseUrl() {
  const isServer = typeof window === "undefined";
  const configured = isServer
    ? process.env.NEXT_SERVER_API_PROXY_TARGET?.trim()
    : process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  const base = configured && configured.length > 0
    ? configured
    : isServer
      ? "http://backend:5001/api"
      : "http://localhost:5001/api";

  const noTrail = base.replace(/\/+$/, "");
  return noTrail.endsWith("/api") ? noTrail : `${noTrail}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000
});

export function setAuthToken(token?: string) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

/** Convert axios errors into a friendly Error message for UI. */
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<ApiError>;
    const data = ax.response?.data;
    if (data?.errors?.length) {
      return data.errors.map((e) => `${e.path}: ${e.message}`).join("; ");
    }
    if (data?.message) return data.message;
    if (ax.message) return ax.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export const hotelApi = {
  // Auth
  login: async (payload: { email: string; password: string }) =>
    (await api.post<LoginResponse>("/auth/login", payload)).data,
  me: async () => (await api.get<AuthUser>("/auth/me")).data,

  // Rooms
  getRooms: async () => (await api.get<Room[]>("/rooms")).data,
  getRoomBySlug: async (slug: string) => (await api.get<Room>(`/rooms/${slug}`)).data,
  createRoom: async (payload: Partial<Room>) =>
    (await api.post<Room>("/rooms", payload)).data,
  updateRoom: async (id: string, payload: Partial<Room>) =>
    (await api.put<Room>(`/rooms/${id}`, payload)).data,
  deleteRoom: async (id: string) => (await api.delete(`/rooms/${id}`)).data,

  // Bookings
  checkAvailability: async (params: { roomId: string; checkIn: string; checkOut: string }) =>
    (await api.get<AvailabilityResponse>("/bookings/availability", { params })).data,
  getAvailabilityCalendar: async (params: { roomId: string; month?: string }) =>
    (await api.get<AvailabilityCalendarResponse>("/bookings/availability/calendar", { params })).data,
  getBookingQuote: async (params: { roomId: string; checkIn: string; checkOut: string; guests?: number }) =>
    (await api.get<BookingQuote>("/bookings/quote", { params })).data,
  createBooking: async (payload: {
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    notes?: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => (await api.post<Booking>("/bookings", payload)).data,
  createMultiRoomBooking: async (payload: MultiRoomBookingPayload) =>
    (await api.post<MultiRoomBookingResponse>("/bookings/multi", payload)).data,
  getBookings: async (filters?: { status?: BookingStatus; email?: string; roomId?: string }) =>
    (await api.get<Booking[]>("/bookings", { params: filters })).data,
  updateBookingStatus: async (id: string, status: BookingStatus) =>
    (await api.put<Booking>(`/bookings/${id}/status`, { status })).data,
  deleteBooking: async (id: string) => (await api.delete(`/bookings/${id}`)).data,

  // Testimonials
  getTestimonials: async (opts?: { all?: boolean }) =>
    (await api.get<Testimonial[]>("/testimonials", { params: opts?.all ? { all: true } : undefined })).data,
  createTestimonial: async (payload: Omit<Testimonial, "id" | "createdAt" | "approved"> & { approved?: boolean }) =>
    (await api.post<Testimonial>("/testimonials", payload)).data,
  updateTestimonial: async (id: string, payload: Partial<Testimonial>) =>
    (await api.put<Testimonial>(`/testimonials/${id}`, payload)).data,
  deleteTestimonial: async (id: string) =>
    (await api.delete(`/testimonials/${id}`)).data,

  // Gallery
  getGallery: async (category?: GalleryCategory) =>
    (await api.get<GalleryItem[]>("/gallery", { params: category ? { category } : undefined })).data,
  createGallery: async (payload: Omit<GalleryItem, "id">) =>
    (await api.post<GalleryItem>("/gallery", payload)).data,
  updateGallery: async (id: string, payload: Partial<GalleryItem>) =>
    (await api.put<GalleryItem>(`/gallery/${id}`, payload)).data,
  deleteGallery: async (id: string) => (await api.delete(`/gallery/${id}`)).data,

  // Uploads
  uploadImage: async (file: File) => {
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post<{ imageUrl: string; storage: string }>("/uploads/image", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },

  // Admin observability
  getRequestLog: async (limit = 100) =>
    (await api.get<{
      total: number;
      capacity: number;
      items: {
        id: number;
        ts: string;
        method: string;
        path: string;
        status: number;
        durationMs: number;
        ip: string;
        ua: string;
        user?: string;
      }[];
    }>("/admin/requests", { params: { limit } })).data,
  clearRequestLog: async () => (await api.delete("/admin/requests")).data,

  // Contact inquiries
  submitContact: async (payload: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => (await api.post<{ success: boolean; id: string }>("/contact", payload)).data,
  getContacts: async () =>
    (await api.get<{
      id: string;
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
      read: boolean;
      createdAt: string;
    }[]>("/contact")).data,
  markContactRead: async (id: string) =>
    (await api.patch(`/contact/${id}/read`)).data,
  deleteContact: async (id: string) =>
    (await api.delete(`/contact/${id}`)).data
};
