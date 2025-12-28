// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // 1. Get the Maintenance Mode flag from Environment Variables
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  // 2. Define the path for the maintenance page
  const maintenancePath = '/maintenance';

  // 3. Logic: If Maintenance Mode is ON
  if (isMaintenanceMode) {
    // If the user is already on the maintenance page, let them stay there
    if (req.nextUrl.pathname === maintenancePath) {
      return NextResponse.next();
    }

    // Allow Next.js internal files (images, fonts, scripts) to load
    if (
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/static') ||
      req.nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|ico)$/)
    ) {
      return NextResponse.next();
    }

    // Redirect EVERY other page to /maintenance
    return NextResponse.redirect(new URL(maintenancePath, req.url));
  }

  // 4. Logic: If Maintenance Mode is OFF
  // If a user tries to go to /maintenance manually, kick them back to home
  if (!isMaintenanceMode && req.nextUrl.pathname === maintenancePath) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

// 5. Config: Apply this middleware to every single route
export const config = {
  matcher: '/:path*',
};