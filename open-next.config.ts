import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  // Explicitly define edge functions for routes that need D1 bindings
  functions: {
    auth: {
      patterns: ["api/auth/*"],
      override: {
        wrapper: "cloudflare-edge",
        converter: "edge",
      }
    },
    dbTest: {
      patterns: ["api/db-test"],
      override: {
        wrapper: "cloudflare-edge",
        converter: "edge",
      }
    }
  },
  edgeExternals: ["node:crypto"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;
