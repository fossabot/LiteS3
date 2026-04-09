"use client";

import { cn, formatBytes } from "@/lib/utils";
import { FileOrFolder, useFileStore } from "@/store/file-store";
import { FileIcon, FolderIcon } from "./file-icon";
import { Thumbnail } from "./thumbnail";
import { isThumbnailable } from "@/hooks/use-thumbnail";

interface FileCardProps {
  item: FileOrFolder;
}

export function FileCard({ item }: FileCardProps) {
  const { navigateToFolder, setPreviewItem, selectedItems, toggleSelect, openContextMenu } = useFileStore();
  const isSelected = selectedItems.has(item.key);
  const isFolder = item.type === "folder";
  const hasThumbnail = !isFolder && isThumbnailable(item.name);

  const handleClick = () => {
    if (isFolder) {
      navigateToFolder(item.key);
    } else {
      setPreviewItem(item);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelect(item.key);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(item, e.clientX, e.clientY);
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border-subtle bg-surface-elevated p-3 transition-all duration-150 hover:border-brand-indigo/50 hover:bg-surface-elevated/80 cursor-pointer",
        isSelected && "border-brand-indigo ring-1 ring-brand-indigo/20"
      )}
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 140px" }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="absolute top-2 right-2 z-10" onClick={handleSelect}>
        <div
          className={cn(
            "h-4 w-4 rounded border transition-colors",
            isSelected ? "bg-brand-indigo border-brand-indigo" : "border-text-quaternary/30 opacity-0 group-hover:opacity-100"
          )}
        >
          {isSelected && (
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 py-4">
        {isFolder ? (
          <FolderIcon className="h-10 w-10 text-blue-500" />
        ) : hasThumbnail ? (
          <Thumbnail name={item.name} itemKey={item.key} size="card" />
        ) : (
          <FileIcon name={item.name} className="h-10 w-10 text-text-tertiary" />
        )}
        <span className="text-sm font-medium text-center truncate w-full px-1 text-text-primary">
          {item.name}
        </span>
        {!isFolder && "size" in item && (
          <span className="text-xs text-text-tertiary">
            {formatBytes(item.size)}
          </span>
        )}
      </div>
    </div>
  );
}
