"use client";

import { useCallback, useState } from "react";
import { useFileStore } from "@/store/file-store";
import { useUploadFile } from "@/hooks/use-files";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "./ui/button";

interface UploadItem {
  file: File;
  key: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export function DropZone() {
  const { currentPrefix } = useFileStore();
  const uploadMutation = useUploadFile();
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    const key = currentPrefix + file.name;
    const uploadItem: UploadItem = {
      file,
      key,
      progress: 0,
      status: "uploading",
    };

    setUploads((prev) => [...prev, uploadItem]);

    try {
      const { url } = await uploadMutation.mutateAsync({
        key,
        contentType: file.type || "application/octet-stream",
      });

      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploads((prev) =>
              prev.map((u) => (u.key === key ? { ...u, progress } : u))
            );
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploads((prev) =>
              prev.map((u) => (u.key === key ? { ...u, status: "done", progress: 100 } : u))
            );
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });
    } catch (error: any) {
      setUploads((prev) =>
        prev.map((u) =>
          u.key === key ? { ...u, status: "error", error: error.message } : u
        )
      );
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        await uploadFile(file);
      }
    },
    [currentPrefix]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      for (const file of files) {
        await uploadFile(file);
      }
      e.target.value = "";
    },
    [currentPrefix]
  );

  const removeUpload = (key: string) => {
    setUploads((prev) => prev.filter((u) => u.key !== key));
  };

  const activeUploads = uploads.filter((u) => u.status !== "done");

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "fixed inset-0 z-40 pointer-events-none transition-all",
          isDragging && "pointer-events-auto bg-brand-indigo/5 border-2 border-dashed border-brand-indigo/50"
        )}
      >
        {isDragging && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-brand-indigo">
              <UploadCloud className="h-16 w-16" />
              <p className="text-lg font-medium">释放以上传文件</p>
            </div>
          </div>
        )}
      </div>

      {activeUploads.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border border-border-subtle bg-surface-elevated shadow-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <span className="text-sm font-medium text-text-primary">上传中</span>
            <span className="text-xs text-text-tertiary">
              {activeUploads.filter((u) => u.status === "done").length}/{uploads.length}
            </span>
          </div>
          <div className="max-h-60 overflow-auto p-2">
            {activeUploads.map((upload) => (
              <div key={upload.key} className="flex items-center gap-2 px-2 py-1.5">
                {upload.status === "uploading" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-brand-indigo flex-shrink-0" />
                ) : upload.status === "error" ? (
                  <X className="h-4 w-4 text-destructive flex-shrink-0" />
                ) : null}
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate text-text-primary">{upload.file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-hover-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-indigo rounded-full transition-all"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-tertiary">
                      {formatBytes(upload.file.size)}
                    </span>
                  </div>
                </div>
                <button onClick={() => removeUpload(upload.key)} className="flex-shrink-0">
                  <X className="h-3 w-3 text-text-tertiary hover:text-text-primary" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
