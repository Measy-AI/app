"use server";

import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function uploadAvatar(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const filename = `avatar/${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`;
  
  const blob = await put(filename, file, {
    access: "private",
  });

  // Update user record
  await db.update(userTable)
    .set({ image: blob.url, updatedAt: new Date() })
    .where(eq(userTable.id, session.user.id));

  revalidatePath("/settings");
  return { url: blob.url };
}

export async function uploadChatImage(formData: FormData, conversationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const filename = `chat/${conversationId}/bilder/${Date.now()}-${file.name}`;
  
  const blob = await put(filename, file, {
    access: "private",
  });

  return { url: blob.url };
}

export async function updateProfile(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  
  await db.update(userTable)
    .set({ name, updatedAt: new Date() })
    .where(eq(userTable.id, session.user.id));

  revalidatePath("/settings");
  return { success: true };
}
