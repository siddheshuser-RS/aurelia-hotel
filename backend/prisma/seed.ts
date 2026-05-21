import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROOMS = [
  {
    title: "Royal Sky Suite",
    slug: "royal-sky-suite",
    description:
      "Floor-to-ceiling windows frame an endless skyline. A private lounge, dedicated butler service, and a marble jacuzzi turn every evening into an occasion.",
    price: 1499,
    capacity: 2,
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1578926314433-c6411db63cf9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80"
    ],
    amenities: ["Private Butler", "Skyline View", "Marble Jacuzzi", "Smart Room Control", "Espresso Bar", "Walk-in Closet", "Rainfall Shower"]
  },
  {
    title: "Imperial Family Residence",
    slug: "imperial-family-residence",
    description:
      "A multi-room residence engineered for indulgent family stays. Dual living areas, a private dining room, and a children's suite with curated entertainment.",
    price: 1999,
    capacity: 5,
    images: [
      "https://images.unsplash.com/photo-1582719478185-2194d9f6f5be?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1578926314433-c6411db63cf9?auto=format&fit=crop&w=1600&q=80"
    ],
    amenities: ["Private Dining", "Kids Suite", "Terrace", "Spa Access", "Personal Concierge", "Games Room", "Nanny Service"]
  },
  {
    title: "Oceanfront Pool Villa",
    slug: "oceanfront-pool-villa",
    description:
      "Step from your bed to a private infinity pool that meets the horizon. Sunken lounges, an outdoor rain shower, and 24/7 villa host.",
    price: 2599,
    capacity: 3,
    images: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80"
    ],
    amenities: ["Private Pool", "Beach Access", "Outdoor Shower", "Villa Host", "Wine Cellar", "Cinema Room", "Infinity Edge Pool"]
  },
  {
    title: "Penthouse Crown Jewel",
    slug: "penthouse-crown-jewel",
    description:
      "The pinnacle of luxury. Spread across three levels with panoramic views, private elevator, and a spa sanctuary carved from Italian marble.",
    price: 3499,
    capacity: 4,
    images: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1578926314433-c6411db63cf9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80"
    ],
    amenities: ["Private Elevator", "3-Level Suite", "Spa Sanctuary", "Panoramic Terrace", "Personal Chef", "Wine Tasting Room", "Private Gym"]
  },
  {
    title: "Serene Garden Escape",
    slug: "serene-garden-escape",
    description:
      "Nestled among blooming gardens and cascading water features. A tranquil retreat with a private meditation pavilion and wellness spa.",
    price: 1299,
    capacity: 2,
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1578926314433-c6411db63cf9?auto=format&fit=crop&w=1600&q=80"
    ],
    amenities: ["Garden Access", "Meditation Pavilion", "Wellness Spa", "Outdoor Soaking Tub", "Holistic Therapist", "Herbal Tea Bar"]
  },
  {
    title: "Romantic Moonlit Suite",
    slug: "romantic-moonlit-suite",
    description:
      "Designed for romance. Candlelit ambiance, a sunken bath for two, and a private balcony overlooking the moonlit ocean.",
    price: 1699,
    capacity: 2,
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=80"
    ],
    amenities: ["Candle-Lit Ambiance", "Sunken Bath for Two", "Sunset Balcony", "Champagne Service", "Romance Package", "Private Massage Room"]
  },
  {
    title: "Golden Hour Heritage Suite",
    slug: "golden-hour-heritage-suite",
    description:
      "Named after the perfect light of sunset. Artfully curated with heritage artwork, a library lounge, and a telescope-equipped terrace.",
    price: 1549,
    capacity: 2,
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1578926314433-c6411db63cf9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80"
    ],
    amenities: ["Private Library", "Art Collection", "Telescope Terrace", "Vintage Wine Selection", "Rare Book Access", "Art Curator Service"]
  }
];

const TESTIMONIALS = [
  {
    name: "Sophia Laurent",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    rating: 5,
    message: "An unforgettable masterpiece of hospitality and elegance. Every detail was anticipated."
  },
  {
    name: "Aarav Mehta",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    rating: 5,
    message: "From arrival to departure, every moment felt cinematic and curated. We will return."
  },
  {
    name: "Isabelle Moreau",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    rating: 5,
    message: "The spa rituals alone justify the journey. Aurelia redefines what 'luxury' means."
  }
];

const GALLERY = [
  { imageUrl: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=80", category: "ROOMS" },
  { imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80", category: "RESTAURANT" },
  { imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80", category: "SPA" },
  { imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80", category: "RESTAURANT" },
  { imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80", category: "EXTERIOR" },
  { imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1600&q=80", category: "LIFESTYLE" }
];

async function main() {
  console.log("[seed] starting...");

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@aurelia.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) {
    throw new Error(
      "[seed] SEED_ADMIN_PASSWORD must be set in the environment and be at least 12 chars. " +
        "Run `node scripts/generate-secrets.js --write` from the repo root, " +
        "or set it manually in backend/.env."
    );
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: passwordHash, role: "ADMIN", name: "Aurelia Admin" },
    create: {
      name: "Aurelia Admin",
      email: adminEmail,
      password: passwordHash,
      role: "ADMIN"
    }
  });
  console.log(`[seed] admin user ready: ${adminEmail}`);

  for (const room of ROOMS) {
    await prisma.room.upsert({
      where: { slug: room.slug },
      update: {
        title: room.title,
        description: room.description,
        price: room.price,
        capacity: room.capacity,
        images: JSON.stringify(room.images),
        amenities: JSON.stringify(room.amenities),
        active: true
      },
      create: {
        title: room.title,
        slug: room.slug,
        description: room.description,
        price: room.price,
        capacity: room.capacity,
        images: JSON.stringify(room.images),
        amenities: JSON.stringify(room.amenities)
      }
    });
  }
  console.log(`[seed] ${ROOMS.length} rooms ready`);

  // Reset and reseed testimonials + gallery (idempotent demo data)
  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: TESTIMONIALS.map((t) => ({ ...t, approved: true }))
  });

  await prisma.gallery.deleteMany();
  await prisma.gallery.createMany({ data: GALLERY });

  console.log("[seed] done");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("[seed] failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
