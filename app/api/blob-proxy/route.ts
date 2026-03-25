import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const blobUrl = searchParams.get("url");

  if (!blobUrl) {
    return new Response("Missing URL", { status: 400 });
  }

  // Validate session (Optional: Only allow logged-in users to see these blobs)
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const response = await fetch(blobUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!response.ok) {
      return new Response("Failed to fetch blob", { status: response.status });
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=3600");

    return new Response(blob, {
      headers,
    });
  } catch (err) {
    return new Response("Error proxying blob", { status: 500 });
  }
}
