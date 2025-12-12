// types.ts

// 1. We define the "Shape" of a Service
export interface Service {
  id: string;           // Unique ID (e.g., "svc_123")
  title: string;        // e.g., "I will design a logo"
  price: number;        // e.g., 50
  description: string;  // Details about the gig
  vendorId: string;     // Who is selling this?
  category: "Design" | "Development" | "Marketing"; // Limit options to only these 3!
  isActive: boolean;    // Is it on sale right now?
}

// 2. We define the "Shape" of a User (Vendor or Customer)
export interface UserProfile {
  id: string;
  email: string;
  role: "admin" | "vendor" | "customer"; // STRICT rule: role cannot be "superman"
}