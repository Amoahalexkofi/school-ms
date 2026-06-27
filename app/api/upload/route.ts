import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;   // 5 MB
const MAX_DOC_BYTES   = 15 * 1024 * 1024;  // 15 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ?type=document widens the accepted types (PDF/Office/text) for attachments.
  const isDoc = req.nextUrl.searchParams.get("type") === "document";
  const allowed = isDoc ? ALLOWED_DOC_TYPES : ALLOWED_IMAGE_TYPES;
  const maxBytes = isDoc ? MAX_DOC_BYTES : MAX_IMAGE_BYTES;

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!allowed.includes(file.type))
    return NextResponse.json({ error: isDoc ? "Unsupported file type" : "Only JPEG, PNG, WebP and GIF images are allowed" }, { status: 400 });
  if (file.size > maxBytes)
    return NextResponse.json({ error: `File must be under ${Math.round(maxBytes / 1048576)} MB` }, { status: 400 });

  const ext = file.name.split(".").pop() ?? (isDoc ? "bin" : "jpg");
  const prefix = isDoc ? "documents" : "photos";
  const filename = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(filename, file, { access: "public" });

  return NextResponse.json({ url: blob.url });
}
