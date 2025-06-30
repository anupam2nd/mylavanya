
// Route configuration constants
export const ROUTES = {
  // Public routes
  HOME: "/",
  SERVICES: "/services",
  SERVICE_DETAIL: "/services/:id",
  ABOUT: "/about",
  CONTACT: "/contact",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  TRACK: "/track",
  TRACK_BOOKING: "/track-booking",
  
  // Common user routes
  PROFILE: "/profile",
  WISHLIST: "/wishlist",
  
  // User dashboard routes
  USER: {
    DASHBOARD: "/user/dashboard",
    PROFILE: "/user/profile",
    SETTINGS: "/user/settings",
    BOOKINGS: "/user/bookings",
    WISHLIST: "/user/wishlist"
  },
  
  // Admin dashboard routes
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    SERVICES: "/admin/services",
    BOOKINGS: "/admin/bookings",
    USERS: "/admin/users",
    MEMBERS: "/admin/members",
    ARTISTS: "/admin/artists",
    CATEGORIES: "/admin/categories",
    BANNER_IMAGES: "/admin/banner-images",
    STATUS: "/admin/status",
    FAQS: "/admin/faqs",
    WISHLIST: "/admin/wishlist",
    ARTIST_ACTIVITY: "/admin/artist-activity"
  },
  
  // Artist dashboard routes
  ARTIST: {
    DASHBOARD: "/artist/dashboard",
    BOOKINGS: "/artist/bookings"
  },
  
  // Controller dashboard routes
  CONTROLLER: {
    DASHBOARD: "/controller/dashboard",
    BOOKINGS: "/controller/bookings",
    ARTIST_ACTIVITY: "/controller/artist-activity"
  }
};
