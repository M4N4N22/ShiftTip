export function getUserIp(req: Request): string {
    // Standard proxy headers (Vercel, Cloudflare, Nginx, etc.)
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
  
    const realIp = req.headers.get("x-real-ip");
    if (realIp) {
      return realIp;
    }
  
    // Fallback 
    return "0.0.0.0";
  }
  