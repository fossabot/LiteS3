import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { copyObject, deleteObject, listObjects, getDefaultBucket } from "@/lib/s3";
import { ensureDatabase } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDatabase();
    
    const { sourceKey, destKey, bucketId } = await request.json();

    if (!sourceKey || !destKey) {
      return NextResponse.json({ error: "sourceKey and destKey are required" }, { status: 400 });
    }

    const bucket = await getDefaultBucket();
    if (!bucket) {
      return NextResponse.json({ error: "No bucket configured" }, { status: 400 });
    }

    const targetBucketId = bucketId || bucket.id;
    
    if (sourceKey.endsWith("/")) {
      const listResult = await listObjects(targetBucketId, sourceKey);
      const allObjects = listResult.Contents || [];
      
      for (const obj of allObjects) {
        if (obj.Key) {
          const relativePath = obj.Key.slice(sourceKey.length);
          const newKey = destKey + relativePath;
          await copyObject(targetBucketId, obj.Key, newKey);
        }
      }
      
      for (const obj of allObjects.reverse()) {
        if (obj.Key) {
          await deleteObject(targetBucketId, obj.Key);
        }
      }
    } else {
      await copyObject(targetBucketId, sourceKey, destKey);
      await deleteObject(targetBucketId, sourceKey);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/files/rename error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
