export type Room = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  capacity: number;
  images: string[];
  amenities: string[];
  active?: boolean;
  createdAt: string;
};

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type Booking = {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  notes?: string | null;
  roomId: string;
  userId?: string | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  room?: Room;
  user?: { id: string; name: string; email: string } | null;
};

export type Testimonial = {
  id: string;
  name: string;
  image: string;
  rating: number;
  message: string;
  approved: boolean;
  createdAt: string;
};

export type GalleryCategory =
  | "ROOMS"
  | "RESTAURANT"
  | "SPA"
  | "EVENTS"
  | "EXTERIOR"
  | "LIFESTYLE";

export type GalleryItem = {
  id: string;
  imageUrl: string;
  category: GalleryCategory;
  caption?: string | null;
  position?: number;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "GUEST";
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type AvailabilityResponse = { available: boolean };

export type AvailabilityCalendarResponse = {
  roomId: string;
  month: string;
  blockedDates: string[];
  inventoryBlocks: { date: string; note: string | null }[];
};

export type BookingQuote = {
  roomId: string;
  roomTitle: string;
  nights: number;
  perNight: { date: string; amount: number }[];
  totalPrice: number;
};

export type MultiRoomBookingPayload = {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  notes?: string;
  rooms: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }[];
};

export type MultiRoomBookingResponse = Booking & {
  rooms: {
    roomId: string;
    roomTitle: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    subtotal: number;
  }[];
};

export type ApiError = {
  message: string;
  errors?: { path: string; message: string }[];
};
