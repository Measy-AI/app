const FORCE_TRUSTED_ORIGIN = process.env.BETTER_AUTH_URL ?? "https://www.measyai.com";

function hasHttpProtocol(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isUsableHostname(hostname: string) {
  return isLocalHostname(hostname) || hostname.includes(".");
}

function toOrigin(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const candidates = hasHttpProtocol(trimmed) ? [trimmed] : [`https://${trimmed}`, `http://${trimmed}`];

  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate);
      if ((parsed.protocol === "http:" || parsed.protocol === "https:") && isUsableHostname(parsed.hostname)) {
        return parsed.origin;
      }
    } catch {
      continue;
    }
  }

  return "";
}

function toHost(origin: string) {
  try {
    return new URL(origin).host;
  } catch {
    return "";
  }
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getForwardedOrigin(request?: Request) {
  if (!request) {
    return "";
  }

  const host = request.headers.get("x-forwarded-host")?.trim() ?? "";
  const proto = request.headers.get("x-forwarded-proto")?.trim() ?? "";
  if (!host || (proto !== "http" && proto !== "https")) {
    return "";
  }

  return toOrigin(`${proto}://${host}`);
}

function getRequestUrlOrigin(request?: Request) {
  if (!request) {
    return "";
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return "";
  }
}

function getHeaderOrigin(request: Request | undefined, headerName: "origin" | "referer") {
  return toOrigin(request?.headers.get(headerName) ?? "");
}

export function buildStaticTrustedOrigins() {
  const configuredOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((origin) => toOrigin(origin));

  return unique([
    toOrigin(FORCE_TRUSTED_ORIGIN),
    toOrigin(process.env.NEXT_PUBLIC_APP_URL ?? ""),
    toOrigin(process.env.BETTER_AUTH_URL ?? ""),
    toOrigin(process.env.VERCEL_URL ?? ""),
    ...configuredOrigins,
  ]);
}

export function buildAllowedHosts() {
  return unique(buildStaticTrustedOrigins().map((origin) => toHost(origin)));
}

export function isLocalhostOrigin(origin: string) {
  try {
    return isLocalHostname(new URL(origin).hostname);
  } catch {
    return origin.includes("localhost") || origin.includes("127.0.0.1");
  }
}

export function resolveAuthBaseUrl() {
  const trustedOrigins = buildStaticTrustedOrigins();
  const publicOrigin = trustedOrigins.find((origin) => !isLocalhostOrigin(origin));

  if (publicOrigin) {
    return publicOrigin;
  }

  if (trustedOrigins.length > 0) {
    return trustedOrigins[0]!;
  }

  return FORCE_TRUSTED_ORIGIN;
}

export function buildTrustedOrigins(request?: Request) {
  const allowedHosts = new Set(buildAllowedHosts());
  const requestOrigins = [
    getRequestUrlOrigin(request),
    getForwardedOrigin(request),
    getHeaderOrigin(request, "origin"),
    getHeaderOrigin(request, "referer"),
  ].filter((origin) => {
    const host = toHost(origin);
    return host ? allowedHosts.has(host) : false;
  });

  return unique([...buildStaticTrustedOrigins(), ...requestOrigins]);
}

export function resolveClientAuthBaseUrl() {
  const configuredOrigin = toOrigin(process.env.NEXT_PUBLIC_APP_URL ?? "");
  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return resolveAuthBaseUrl();
}
