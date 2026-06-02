import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadObject, getDefaultBucket, getBucketConfig } from "@/lib/s3";
import { ensureDatabase } from "@/lib/db";

const MAX_UPLOAD_SIZE = 100 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDatabase();
    
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const key = formData.get("key") as string | null;
    const bucketId = formData.get("bucketId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: "File size exceeds 100MB limit" }, { status: 413 });
    }

    const bucket = bucketId ? await getBucketConfig(bucketId) : await getDefaultBucket();
    if (!bucket) {
      return NextResponse.json({ error: "No bucket configured" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await uploadObject(
      bucketId || bucket.id,
      key,
      buffer,
      file.type || "application/octet-stream"
    );

    return NextResponse.json({ success: true, key });
  } catch (error: unknown) {
    console.error("POST /api/files/upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
