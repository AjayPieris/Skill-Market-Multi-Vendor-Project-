// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seeding...");

  // 1. CLEANUP: Delete old data so we don't get duplicates
  await prisma.gig.deleteMany();
  await prisma.user.deleteMany();

  // 2. CREATE VENDOR 1: The Designer
  const designer = await prisma.user.create({
    data: {
      email: "alex@design.com",
      name: "Alex The Artist",
      role: "vendor",
      clerkId: "user_123_fake_id", // Fake ID for now
      bio: "I have been designing logos for 10 years.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", // Free avatar API
      
      // Create Gigs for this vendor immediately
      gigs: {
        create: [
          {
            title: "I will design a minimalist logo",
            description: "Get a clean, modern logo for your startup.",
            category: "Design",
            price: 50,
            imageUrl: "https://placehold.co/600x400/purple/white?text=Logo+Design",
          },
          {
            title: "I will create social media kit",
            description: "Banners for Twitter, LinkedIn, and Facebook.",
            category: "Design",
            price: 30,
            imageUrl: "https://placehold.co/600x400/pink/white?text=Social+Media",
          },
        ],
      },
    },
  });

  // 3. CREATE VENDOR 2: The Developer
  const developer = await prisma.user.create({
    data: {
      email: "sarah@code.com",
      name: "Sarah Coder",
      role: "vendor",
      clerkId: "user_456_fake_id",
      bio: "Full stack developer specializing in React.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      
      gigs: {
        create: [
          {
            title: "I will fix your React bugs",
            description: "Stuck on a bug? I will fix it in 2 hours.",
            category: "Development",
            price: 100,
            imageUrl: "https://placehold.co/600x400/black/white?text=React+Fix",
          },
          {
            title: "I will build a landing page",
            description: "High converting landing page using Tailwind.",
            category: "Development",
            price: 250,
            imageUrl: "https://placehold.co/600x400/blue/white?text=Landing+Page",
          },
        ],
      },
    },
  });

  console.log("✅ Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });