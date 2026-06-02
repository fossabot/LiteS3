import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { copyObject, deleteObject, listAllObjects, getDefaultBucket, getBucketConfig } from "@/lib/s3";
import { ensureDatabase } from "@/lib/db";
import { parallelWithLimit } from "@/lib/concurrent";

const MAX_CONCURRENT = 5;

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

    const bucket = bucketId ? await getBucketConfig(bucketId) : await getDefaultBucket();
    if (!bucket) {
      return NextResponse.json({ error: "No bucket configured" }, { status: 400 });
    }

    const targetBucketId = bucketId || bucket.id;

    if (sourceKey.endsWith("/")) {
      const allObjects = await listAllObjects(targetBucketId, sourceKey);
      const objectsWithKey = allObjects.filter(obj => obj.Key);

      const copyTasks = objectsWithKey.map(obj => ({
        source: obj.Key!,
        dest: destKey + obj.Key!.slice(sourceKey.length),
      }));

      await parallelWithLimit(
        copyTasks,
        (task) => copyObject(targetBucketId, task.source, task.dest),
        MAX_CONCURRENT
      );
    } else {
      await copyObject(targetBucketId, sourceKey, destKey);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("POST /api/files/move error:", error);
    return NextResponse.json({ error: "Copy failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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

    const bucket = bucketId ? await getBucketConfig(bucketId) : await getDefaultBucket();
    if (!bucket) {
      return NextResponse.json({ error: "No bucket configured" }, { status: 400 });
    }

    const targetBucketId = bucketId || bucket.id;

    if (sourceKey.endsWith("/")) {
      const allObjects = await listAllObjects(targetBucketId, sourceKey);
      const objectsWithKey = allObjects.filter(obj => obj.Key);

      const copyTasks = objectsWithKey.map(obj => ({
        source: obj.Key!,
        dest: destKey + obj.Key!.slice(sourceKey.length),
      }));

      await parallelWithLimit(
        copyTasks,
        (task) => copyObject(targetBucketId, task.source, task.dest),
        MAX_CONCURRENT
      );

      const deleteKeys = objectsWithKey.map(obj => obj.Key!);
      deleteKeys.push(sourceKey);
      await parallelWithLimit(
        deleteKeys,
        (key) => deleteObject(targetBucketId, key),
        MAX_CONCURRENT
      );
    } else {
      await copyObject(targetBucketId, sourceKey, destKey);
      await deleteObject(targetBucketId, sourceKey);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("PATCH /api/files/move error:", error);
    return NextResponse.json({ error: "Move failed" }, { status: 500 });
  }
}
