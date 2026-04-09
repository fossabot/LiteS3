"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useFiles, useMoveFile, useCopyFile } from "@/hooks/use-files";
import { FileOrFolder } from "@/store/file-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder, Loader2, ChevronRight, Home, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoveCopyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FileOrFolder | null;
  mode: "move" | "copy";
}

export function MoveCopyDialog({ open, onOpenChange, item, mode }: MoveCopyDialogProps) {
  const { t } = useTranslation();
  const [selectedPath, setSelectedPath] = useState("");
  const [currentBrowsePath, setCurrentBrowsePath] = useState("");
  const moveFile = useMoveFile();
  const copyFile = useCopyFile();
  
  const { data } = useFiles(currentBrowsePath);
  
  useEffect(() => {
    if (open) {
      setSelectedPath("");
      setCurrentBrowsePath("");
    }
  }, [open]);

  const folders = data?.folders || [];
  
  const pathParts = currentBrowsePath.split("/").filter(Boolean);

  const handleNavigateToFolder = (folderKey: string) => {
    setCurrentBrowsePath(folderKey);
  };

  const handleNavigateUp = () => {
    const parts = currentBrowsePath.split("/").filter(Boolean);
    parts.pop();
    setCurrentBrowsePath(parts.join("/") + (parts.length > 0 ? "/" : ""));
  };

  const handleNavigateToPath = (index: number) => {
    const parts = pathParts.slice(0, index + 1);
    setCurrentBrowsePath(parts.join("/") + "/");
  };

  const handleConfirm = async () => {
    if (!item) return;

    const isFolder = item.type === "folder";
    const sourceKey = item.key;
    let destKey: string;

    if (isFolder) {
      const folderName = item.name;
      destKey = selectedPath + folderName + "/";
    } else {
      destKey = selectedPath + item.name;
    }

    try {
      if (mode === "move") {
        await moveFile.mutateAsync({ sourceKey, destKey });
      } else {
        await copyFile.mutateAsync({ sourceKey, destKey });
      }
      onOpenChange(false);
    } catch (error) {
      console.error(`Failed to ${mode}:`, error);
    }
  };

  const isPending = mode === "move" ? moveFile.isPending : copyFile.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "move" ? (
              <FolderOpen className="h-5 w-5 text-brand-indigo" />
            ) : (
              <Folder className="h-5 w-5 text-brand-indigo" />
            )}
            {mode === "move" ? t("files.moveTitle") : t("files.copyTitle")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          <div className="text-sm text-text-secondary mb-2">
            {t("files.selectFolder")}
          </div>
          
          <div className="flex items-center gap-1 text-sm text-text-quaternary mb-3 px-2 py-1.5 bg-surface-elevated rounded-md border border-border-subtle overflow-x-auto">
            <button
              onClick={() => setCurrentBrowsePath("")}
              className="hover:text-text-primary transition-colors flex items-center gap-1"
            >
              <Home className="h-3.5 w-3.5" />
              <span>{t("files.root")}</span>
            </button>
            {pathParts.map((part, index) => (
              <span key={index} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                <button
                  onClick={() => handleNavigateToPath(index)}
                  className="hover:text-text-primary transition-colors"
                >
                  {part}
                </button>
              </span>
            ))}
          </div>

          <div className="border border-border-subtle rounded-md max-h-64 overflow-y-auto">
            {currentBrowsePath !== "" && (
              <div
                onClick={handleNavigateUp}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-hover-bg transition-colors border-b border-border-subtle"
              >
                <Folder className="h-5 w-5 text-brand-indigo shrink-0" />
                <span className="text-sm text-text-secondary">..</span>
              </div>
            )}
            
            {folders.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-text-quaternary text-sm">
                {t("files.emptyFolder")}
              </div>
            ) : (
              folders.map((folder: { key: string; name: string }) => (
                <div
                  key={folder.key}
                  onClick={() => setSelectedPath(folder.key)}
                  onDoubleClick={() => handleNavigateToFolder(folder.key)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors",
                    selectedPath === folder.key
                      ? "bg-accent-violet/10 text-accent-violet"
                      : "hover:bg-hover-bg"
                  )}
                >
                  <Folder className="h-5 w-5 text-brand-indigo shrink-0" />
                  <span className="text-sm truncate">{folder.name}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 text-sm text-text-secondary">
            {t("files.currentFolder")}:{" "}
            <span className="text-text-primary">
              {selectedPath || t("files.root")}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            {t("buckets.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedPath && currentBrowsePath === "" || isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {mode === "move" ? t("files.move") : t("files.copy")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
