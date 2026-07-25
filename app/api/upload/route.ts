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

// Vercel Blob derives the served Content-Type from the *pathname's*
// extension unless one is passed explicitly — and that extension came from
// the client-supplied file.name, entirely independent of the file.type we
// just validated below. A file named "evil.svg" with a spoofed
// file.type: "image/jpeg" would pass the allowlist check yet still be
// served back as image/svg+xml (browser-renderable, script-capable) purely
// because of its filename. Mapping the extension from the validated MIME
// type — and passing that same type explicitly to put() — ties what we
// checked to what actually gets served, so the filename can't smuggle a
// different type through.
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/plain": "txt",
};

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

  const ext = EXT_BY_TYPE[file.type] ?? (isDoc ? "bin" : "jpg");
  const prefix = isDoc ? "documents" : "photos";
  const filename = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(filename, file, { access: "public", contentType: file.type });

  return NextResponse.json({ url: blob.url });
}
