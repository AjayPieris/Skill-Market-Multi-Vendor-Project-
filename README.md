<div align="center">

# 🛒 Skill Market

### A Full-Stack Multi-Vendor Freelance Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

A production-ready freelance services marketplace where vendors list professional gigs and buyers discover, purchase, and review services — featuring real-time messaging, Instagram-style stories, Stripe-powered payments, and a full admin control panel.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [Environment Variables](#-environment-variables) · [Database Schema](#-database-schema) · [Screenshots](#-screenshots)

</div>

---

## ✨ Features

### 🏪 Marketplace Core
- **Gig Listings** — Vendors create service listings with multi-image galleries (up to 4 images), categories, pricing, package details, delivery timelines, and revision policies
- **Advanced Search** — Real-time debounced search across gig titles, descriptions, and categories with URL-based query persistence
- **Hover Image Carousel** — Interactive image previews on gig cards with smooth transitions
- **Star Ratings & Reviews** — Verified buyer reviews with 1–5 star ratings, enforced one-review-per-order policy
- **Category Filtering** — Quick-access category tags (Design, Development, Strategy) for streamlined discovery

### 💳 Payments & Orders
- **Stripe Checkout Integration** — Secure payment processing via Stripe Checkout Sessions with full metadata tracking
- **Idempotent Order Fulfillment** — Duplicate-safe order creation using unique `stripeSessionId` to prevent double charges on page refresh
- **Order History** — Complete transaction tracking for both buyers and vendors
- **Revenue Analytics** — Real-time revenue, order count, and average order value metrics

### 💬 Real-Time Communication
- **Live Chat Widget** — Navbar-integrated messaging panel powered by Pusher with real-time message delivery, read receipts, and unread count badges
- **Conversation Management** — Searchable chat list with last-message previews, auto-created conversations on follow
- **Contact Seller** — One-click conversation initiation from any gig detail page

### 📸 Stories / Status
- **Instagram-Style Stories** — Users post image or video stories visible to followers for 24 hours with automatic expiration
- **Story Viewer** — Full-screen immersive viewer with progress bars, pause/play controls, and tap-to-navigate gestures
- **Video Support** — Native video playback with mute/unmute controls and time-synced progress tracking
- **View Analytics** — Story owners see real-time view counts and a detailed viewers list
- **Story Replies** — Viewers can reply directly to stories, which are delivered as DMs to the story owner
- **Media Upload** — Drag-and-drop or click-to-upload with UploadThing integration and caption support

### 🔔 Notifications
- **Real-Time Activity Feed** — Pusher-powered notification bell with instant alerts for new orders, follows, gig creations, and gig updates
- **Typed Notifications** — Color-coded notification categories (Order, Follow, New Gig, Updated) with contextual deep-linking
- **Panel Coordination** — Intelligent panel management — opening one panel (chat, notifications, stories) auto-closes others

### 👥 Social Features
- **Follow System** — Users follow vendors to stay updated; followers are displayed in the vendor's dashboard sidebar
- **Member Profiles** — Public profile pages showcasing vendor bio, portfolio gigs, and social stats
- **Followers Sidebar** — Desktop sidebar and mobile bottom-sheet displaying the vendor's follower list

### 🛡️ Admin Panel
- **Platform Dashboard** — Overview cards for total revenue, registered users, active vendors, live gigs, total orders, and average order value
- **User Management Table** — Paginated list of newest users with role badges and registration dates
- **Vendor Management** — Dedicated vendor listing with the ability to block/unblock sellers
- **Role-Based Access Control** — Middleware-enforced route protection with automatic redirects for unauthorized users

### 📱 Vendor Dashboard
- **Overview** — Revenue, active gigs, and order statistics at a glance
- **Gig Management** — Full CRUD operations with soft-delete support, multi-image upload, and package configuration
- **Order Tracking** — View all incoming orders with status and buyer details
- **Profile Editor** — Update name, bio, and profile image
- **Mobile Bottom Navigation** — Responsive bottom tab bar for seamless mobile experience

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Server Components, Server Actions) |
| **Frontend** | React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, Radix UI Primitives, shadcn/ui |
| **Typography** | Outfit (Google Fonts) |
| **Database** | PostgreSQL (Neon Serverless) |
| **ORM** | Prisma 7 with `@prisma/adapter-neon` |
| **Authentication** | Clerk (SSO, OAuth, Session Management) |
| **Payments** | Stripe (Checkout Sessions, Webhooks) |
| **Real-Time** | Pusher (WebSocket channels for chat, notifications, presence) |
| **File Uploads** | UploadThing (images, videos for gigs & stories) |
| **Icons** | Lucide React |
| **Utilities** | clsx, tailwind-merge, class-variance-authority, use-debounce |

---

## 🏗 Architecture

```
skill-market/
├── app/
│   ├── (admin)/                # Admin route group
│   │   ├── layout.tsx          #   Role-gated admin layout
│   │   └── admin-panel/        #   Dashboard overview & vendor management
│   ├── (vendor)/               # Vendor route group
│   │   ├── layout.tsx          #   Vendor layout with sidebar & mobile nav
│   │   └── dashboard/          #   Overview, gigs CRUD, orders, profile
│   ├── (public)/               # Public route group
│   │   ├── search/             #   Debounced gig search page
│   │   └── become-seller/      #   Vendor registration flow
│   ├── api/                    # API routes
│   │   ├── conversations/      #   Chat conversation endpoints
│   │   ├── messages/           #   Message send, mark-read
│   │   ├── follow/             #   Follow/unfollow actions
│   │   ├── notifications/      #   Activity notification endpoints
│   │   ├── statuses/           #   Stories feed & management
│   │   ├── stripe/             #   Stripe webhook handler
│   │   └── uploadthing/        #   File upload routes
│   ├── actions/                # Server Actions
│   │   ├── admin.ts            #   Block/unblock users
│   │   ├── gig.ts              #   Gig CRUD operations
│   │   ├── order.ts            #   Checkout & order fulfillment
│   │   ├── review.ts           #   Review submission
│   │   ├── status.ts           #   Story create/delete/view/reply
│   │   ├── message.ts          #   Message server actions
│   │   ├── conversation.ts     #   Conversation management
│   │   ├── profile.ts          #   Profile updates
│   │   └── notification.ts     #   Notification actions
│   ├── gigs/[id]/              # Dynamic gig detail page
│   ├── inbox/[conversationId]/ # Full-page inbox view
│   ├── members/[userId]/       # Public member profile
│   ├── orders/success/         # Post-payment confirmation
│   ├── layout.tsx              # Root layout (Clerk, Navbar, Footer)
│   └── page.tsx                # Homepage (hero, gig grid, marquee)
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── ChatBox.tsx             # Full-page chat component
│   ├── NavChatWidget.tsx       # Navbar floating chat panel
│   ├── NotificationBell.tsx    # Real-time notification dropdown
│   ├── StatusBar.tsx           # Stories feed, viewer, & upload
│   ├── Navbar.tsx              # Global navigation bar
│   ├── Footer.tsx              # Site footer
│   ├── SearchInput.tsx         # Debounced search component
│   ├── ReviewForm.tsx          # Star rating review form
│   ├── FollowersSidebar.tsx    # Vendor follower list
│   ├── HoverImageCarousel.tsx  # Gig card image carousel
│   └── ...                     # Additional components
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── pusher.ts               # Pusher server instance
│   ├── stripe.ts               # Stripe client instance
│   ├── uploadthing.ts          # UploadThing configuration
│   └── utils.ts                # Utility functions (cn)
├── prisma/
│   ├── schema.prisma           # Database schema (8 models)
│   └── seed.ts                 # Database seeder
└── middleware.ts               # Clerk auth middleware
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** or **yarn**
- **PostgreSQL** database ([Neon](https://neon.tech) recommended for serverless)
- Accounts for: [Clerk](https://clerk.com), [Stripe](https://stripe.com), [Pusher](https://pusher.com), [UploadThing](https://uploadthing.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/skill-market.git
   cd skill-market
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in all required values (see [Environment Variables](#-environment-variables) below).

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed the database** *(optional)*
   ```bash
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ─── Database ────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# ─── Clerk Authentication ────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# ─── Stripe Payments ────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── Pusher (Real-Time) ─────────────────────────────────
PUSHER_APP_ID=...
NEXT_PUBLIC_PUSHER_KEY=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_CLUSTER=...

# ─── UploadThing (File Uploads) ──────────────────────────
UPLOADTHING_TOKEN=...
```

---

## 🗄 Database Schema

The application uses **8 interconnected Prisma models** mapped to a PostgreSQL database:

```mermaid
erDiagram
    User ||--o{ Gig : "creates (vendor)"
    User ||--o{ Order : "places (buyer)"
    User ||--o{ Review : "writes"
    User ||--o{ Follow : "follows"
    User ||--o{ Follow : "followed by"
    User ||--o{ Status : "posts"
    User ||--o{ Conversation : "initiates"
    User ||--o{ Conversation : "receives"
    User ||--o{ Message : "sends"
    Gig ||--o{ Order : "purchased via"
    Gig ||--o{ Review : "reviewed on"
    Order ||--o| Review : "has at most one"
    Conversation ||--o{ Message : "contains"
    Status ||--o{ StatusView : "tracked by"
```

| Model | Description |
|---|---|
| `User` | Core entity — supports Admin, Vendor, and Customer roles with optional bio, image, and block status |
| `Gig` | Service listing with title, description, price, multi-image gallery, category, package details, and soft-delete |
| `Order` | Purchase record linking buyer → gig with Stripe session ID for idempotent fulfillment |
| `Review` | 1–5 star rating with comment, enforced one-per-order via unique constraint |
| `Follow` | Many-to-many self-relation on User with unique follower–following pair |
| `Conversation` | One-to-one chat thread between two users with unique pair constraint |
| `Message` | Individual message within a conversation with read-receipt tracking |
| `Status` | Ephemeral story post (image/video) with 24-hour expiration and caption |
| `StatusView` | View tracking for stories with unique viewer–status constraint |

---


## 🧪 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Generate Prisma client & build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality checks |
| `npx prisma studio` | Open Prisma Studio for visual database management |
| `npx prisma db push` | Push schema changes to the database |
| `npx prisma db seed` | Seed the database with sample data |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ using Next.js, Prisma, Stripe, and Pusher**

⭐ Star this repository if you found it useful!

</div>
