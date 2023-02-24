export function getDomainUrl(request: Request) {
    if(process.env.APP_BASE_URL){
        return process.env.APP_BASE_URL
    }

    const host =
      request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");
    if (!host) {
      throw new Error("Could not determine domain URL.");
    }
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }