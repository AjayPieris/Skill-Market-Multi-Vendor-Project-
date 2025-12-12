import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// Import Clerk tools for authentication and route matching


// Define which routes require the user to be logged in
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',      // Protect all dashboard pages (e.g. /dashboard/settings)
  '/admin-panel(.*)'     // Protect all admin panel pages
]);


export default clerkMiddleware(async (auth, req) => {
  // Middleware runs before every request
  if (isProtectedRoute(req))       // If the request matches a protected route...
    await auth.protect();          // ...require the user to be logged in
});


// Tell Next.js which routes should run through this middleware
export const config = {
  matcher: [
    // Apply middleware to all pages EXCEPT Next.js internals or static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

    // Always apply middleware to API routes
    '/(api|trpc)(.*)',
  ],
};
