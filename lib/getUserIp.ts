function isPublicIPv4(ip: string) {
    return (
      /^\d{1,3}(\.\d{1,3}){3}$/.test(ip) &&
      !ip.startsWith("10.") &&
      !ip.startsWith("192.168.") &&
      !ip.startsWith("172.") &&
      ip !== "127.0.0.1"
    );
  }
  
  export function getUserIp(req: Request): string {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
  
    const candidates = [
      forwardedFor?.split(",")[0]?.trim(),
      realIp,
    ].filter(Boolean) as string[];
  
    for (const ip of candidates) {
      // reject localhost + IPv6
      if (ip === "::1") continue;
      if (isPublicIPv4(ip)) return ip;
    }
  
    // LOCAL / DEV FALLBACK (REQUIRED for SideShift)
    // SideShift REQUIRES a public IPv4
    return "8.8.8.8";
  }
  