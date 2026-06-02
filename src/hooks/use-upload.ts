"use client";

import { useState, useCallback, useEffect } from "react";
import { useFileStore } from "@/store/file-store";
import { useQueryClient } from "@tanstack/react-query";
import { parallelWithLimit } from "@/lib/concurrent";

interface UploadItem {
  id: string;
  file: File;
  key: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

const MAX_CONCURRENT_UPLOADS = 3;
const DONE_ITEM_TTL = 30_000;

let uploadsState: UploadItem[] = [];
const listeners: Set<() => void> = new Set();

function setUploads(newUploads: UploadItem[] | ((prev: UploadItem[]) => UploadItem[])) {
  uploadsState = typeof newUploads === "function" ? newUploads(uploadsState) : newUploads;
  listeners.forEach((listener) => listener());
}

setInterval(() => {
  const now = Date.now();
  const before = uploadsState.length;
  uploadsState = uploadsState.filter((u) => {
    if (u.status === "done" || u.status === "error") {
      const age = now - parseInt(u.id.split("-")[0], 10);
      if (age > DONE_ITEM_TTL) return false;
    }
    return true;
  });
  if (uploadsState.length !== before) {
    listeners.forEach((listener) => listener());
  }
}, 10_000);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useUpload() {
  const { currentPrefix, currentBucketId } = useFileStore();
  const queryClient = useQueryClient();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const uploadFile = async (file: File, prefix?: string) => {
    const id = generateId();
    const key = (prefix || currentPrefix) + file.name;
    const uploadItem: UploadItem = {
      id,
      file,
      key,
      progress: 0,
      status: "uploading",
    };

    setUploads((prev) => [...prev, uploadItem]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", key);
      if (currentBucketId) {
        formData.append("bucketId", currentBucketId);
      }

      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploads((prev) =>
              prev.map((u) => (u.id === id ? { ...u, progress } : u))
            );
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploads((prev) =>
              prev.map((u) => (u.id === id ? { ...u, status: "done", progress: 100 } : u))
            );
            resolve();
          } else {
            const error = xhr.responseText ? JSON.parse(xhr.responseText).error : `Upload failed: ${xhr.status}`;
            reject(new Error(error));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.open("POST", "/api/files/upload");
        xhr.send(formData);
      });

      queryClient.invalidateQueries({ queryKey: ["files"] });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setUploads((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: "error", error: message } : u
        )
      );
    }
  };

  const uploadFiles = async (files: FileList | File[], prefix?: string) => {
    const fileArray = Array.from(files);
    await parallelWithLimit(
      fileArray,
      (file) => uploadFile(file, prefix),
      MAX_CONCURRENT_UPLOADS
    );
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const uploads = uploadsState;
  const activeUploads = uploads.filter((u) => u.status !== "done");

  return {
    uploads,
    activeUploads,
    uploadFile,
    uploadFiles,
    removeUpload,
  };
}
