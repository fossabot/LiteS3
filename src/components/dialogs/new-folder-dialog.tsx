"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useCreateFolder } from "@/hooks/use-files";
import { useFileStore } from "@/store/file-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FolderPlus, Loader2 } from "lucide-react";

interface NewFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewFolderDialog({ open, onOpenChange }: NewFolderDialogProps) {
  const { t } = useTranslation();
  const { currentPrefix } = useFileStore();
  const [name, setName] = useState("");
  const createFolder = useCreateFolder();

  const handleCreate = async () => {
    if (!name.trim()) return;

    const folderKey = currentPrefix + name.trim() + "/";
    
    try {
      await createFolder.mutateAsync(folderKey);
      setName("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-brand-indigo" />
            {t("files.newFolder")}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("files.folderName")}
            className="w-full px-3 py-2 text-sm bg-transparent border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent text-text-primary placeholder:text-text-quaternary"
            autoFocus
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
            onClick={handleCreate}
            disabled={!name.trim() || createFolder.isPending}
          >
            {createFolder.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {t("files.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
