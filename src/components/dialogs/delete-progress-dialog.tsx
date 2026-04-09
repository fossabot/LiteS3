"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Check, Loader2 } from "lucide-react";

interface DeleteProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: string[];
  onComplete?: () => void;
}

export function DeleteProgressDialog({ open, onOpenChange, items, onComplete }: DeleteProgressDialogProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"deleting" | "complete" | "error">("deleting");
  const [deletedCount, setDeletedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || items.length === 0) return;

    const deleteItems = async () => {
      setStatus("deleting");
      setDeletedCount(0);
      setError(null);

      let successCount = 0;
      
      for (let i = 0; i < items.length; i++) {
        try {
          const res = await fetch(`/api/files/delete?key=${encodeURIComponent(items[i])}`, {
            method: "DELETE",
          });
          
          if (res.ok) {
            const data = await res.json();
            successCount += data.deleted || 1;
          } else {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Delete failed");
          }
          
          setDeletedCount(successCount);
        } catch (err) {
          console.error(`Failed to delete ${items[i]}:`, err);
        }
      }

      setStatus("complete");
      onComplete?.();
    };

    deleteItems();
  }, [open, items, onComplete]);

  const handleClose = () => {
    if (status === "complete") {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {status === "deleting" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-brand-indigo" />
                {t("files.deleting")}
              </>
            ) : status === "complete" ? (
              <>
                <Check className="h-5 w-5 text-green-500" />
                {t("files.deleteComplete")}
              </>
            ) : (
              <>
                <Trash2 className="h-5 w-5 text-destructive" />
                {t("files.operationFailed")}
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          {status === "deleting" && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-border-subtle"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      className="text-brand-indigo transition-all duration-300"
                      strokeDasharray={`${(deletedCount / items.length) * 352} 352`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-medium text-text-primary">
                      {Math.round((deletedCount / items.length) * 100) || 0}%
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-text-secondary">
                {t("files.deleteProgress")}: {deletedCount} / {items.length}
              </p>
            </div>
          )}
          
          {status === "complete" && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <p className="text-text-primary">
                {deletedCount} {t("files.itemsDeleted")}
              </p>
            </div>
          )}
          
          {status === "error" && (
            <div className="text-center space-y-4">
              <p className="text-destructive">{error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
