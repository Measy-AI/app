"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Camera, Mail, User, Loader2, Check } from "lucide-react";
import { uploadAvatar, updateProfile } from "@/lib/actions/upload";
import { cn, toProxyUrl } from "@/lib/utils";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.image);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const localUrl = URL.createObjectURL(file);
    setAvatar(localUrl);

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadAvatar(formData);
      setAvatar(res.url);
      toast.success("Avatar updated successfully!");
    } catch (err) {
      toast.error("Failed to upload avatar");
      setAvatar(user.image); // Revert
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    formData.append("name", name);

    try {
      await updateProfile(formData);
      toast.success("Profile saved!");
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-12">
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
        <div className="group relative">
          <div className="relative size-32 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl transition-all group-hover:border-primary/50 group-hover:shadow-primary/20">
            {avatar ? (
              <img src={toProxyUrl(avatar)} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                <User className="size-12 text-zinc-700" />
              </div>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            )}

            <label className="absolute inset-x-0 bottom-0 cursor-pointer bg-black/40 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-black/60 opacity-0 group-hover:opacity-100">
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
              Change
            </label>
          </div>
          <div className="absolute -bottom-2 -right-2 rounded-xl bg-primary p-2 text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
            <Camera className="size-4" />
          </div>
        </div>

        <div className="flex-1 space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-bold tracking-tight text-white">Profile Photo</h3>
          <p className="text-sm text-zinc-400">
            This will be displayed on your profile and workspace.
            <br />
            Allowed formats: JPG, PNG, WEBP.
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-white/5" />

      {/* Inputs Section */}
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <User className="size-3" /> Full Name
          </label>
          <div className="group relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4 text-zinc-100 transition-all focus:border-primary/50 focus:bg-white/[0.05] focus:outline-none focus:ring-4 focus:ring-primary/10"
              placeholder="Your full name"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <Mail className="size-3" /> Email Address
          </label>
          <div className="relative opacity-60">
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full cursor-not-allowed rounded-2xl border border-white/5 bg-black/20 px-5 py-4 text-zinc-400 outline-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-500">
              Locked
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-6">
        <button
          type="submit"
          disabled={isSaving || isUploading || name === user.name}
          className={cn(
            "flex items-center gap-2 rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-40",
            name !== user.name 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30" 
              : "bg-zinc-800 text-zinc-400"
          )}
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Check className="size-4" /> Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
