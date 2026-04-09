"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useRenameFile } from "@/hooks/use-files";
import { useFileStore, FileOrFolder } from "@/store/file-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2 } from "lucide-react";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileOrFolder | null;
}

export function RenameDialog({ open, onOpenChange, item }: RenameDialogProps) {
  const { t } = useTranslation();
  const { currentPrefix } = useFileStore();
  const [name, setName] = useState("");
  const renameFile = useRenameFile();

  useEffect(() => {
    if (item) {
      setName(item.name);
    }
  }, [item]);

  const handleRename = async () => {
    if (!item || !name.trim() || name === item.name) return;

    const isFolder = item.type === "folder";
    const sourceKey = item.key;
    let destKey: string;

    if (isFolder) {
      const parentPath = sourceKey.slice(0, -item.name.length - 1);
      destKey = parentPath + name.trim() + "/";
    } else {
      destKey = currentPrefix + name.trim();
    }

    try {
      await renameFile.mutateAsync({ sourceKey, destKey });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to rename:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-brand-indigo" />
            {t("files.rename")}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("files.newName")}
            className="w-full px-3 py-2 text-sm bg-transparent border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent text-text-primary placeholder:text-text-quaternary"
            autoFocus
            onFocus={(e) => {
              const lastDot = name.lastIndexOf(".");
              if (lastDot > 0) {
                e.target.setSelectionRange(0, lastDot);
              } else {
                e.target.select();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            {t("buckets.cancel")}
          </Button>
          <Button
            onClick={handleRename}
            disabled={!name.trim() || name === item?.name || renameFile.isPending}
          >
            {renameFile.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {t("files.rename")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
