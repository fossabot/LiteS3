"use client";

import { useEffect } from "react";
import { useFileStore } from "@/store/file-store";
import { useDeleteFile, useFileLink } from "@/hooks/use-files";
import { Pencil, Trash2, Copy, Move, Link, Download, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContextMenu() {
  const { contextMenu, closeContextMenu, setPreviewItem } = useFileStore();
  const deleteMutation = useDeleteFile();
  const linkMutation = useFileLink();

  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => closeContextMenu();
    const handleScroll = () => closeContextMenu();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContextMenu();
    };
    document.addEventListener("click", handleClick);
    document.addEventListener("scroll", handleScroll, true);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("keydown", handleKey);
    };
  }, [contextMenu, closeContextMenu]);

  if (!contextMenu) return null;

  const { item, x, y } = contextMenu;
  const isFolder = item.type === "folder";

  const handleDelete = () => {
    closeContextMenu();
    if (confirm(`确定要删除 ${item.name} 吗？`)) {
      deleteMutation.mutate(item.key);
    }
  };

  const handleCopyLink = async () => {
    closeContextMenu();
    const result = await linkMutation.mutateAsync({ key: item.key });
    if (result.url) {
      await navigator.clipboard.writeText(result.url);
      alert("链接已复制到剪贴板");
    }
  };

  const handleDownload = async () => {
    closeContextMenu();
    const result = await linkMutation.mutateAsync({ key: item.key });
    if (result.url) {
      window.open(result.url, "_blank");
    }
  };

  const handlePreview = () => {
    closeContextMenu();
    setPreviewItem(item);
  };

  return (
    <div
      className={cn(
        "fixed z-50 min-w-32 overflow-hidden rounded-lg border border-border-subtle bg-surface-elevated p-1 text-text-primary shadow-lg animate-in fade-in-0 zoom-in-95"
      )}
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {!isFolder && (
        <>
          <MenuItem onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" /> 预览
          </MenuItem>
          <MenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> 下载
          </MenuItem>
          <MenuItem onClick={handleCopyLink}>
            <Link className="mr-2 h-4 w-4" /> 复制链接
          </MenuItem>
          <MenuSeparator />
        </>
      )}
      <MenuItem>
        <Pencil className="mr-2 h-4 w-4" /> 重命名
      </MenuItem>
      <MenuItem>
        <Move className="mr-2 h-4 w-4" /> 移动
      </MenuItem>
      <MenuItem>
        <Copy className="mr-2 h-4 w-4" /> 复制
      </MenuItem>
      <MenuSeparator />
      <MenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
        <Trash2 className="mr-2 h-4 w-4" /> 删除
      </MenuItem>
    </div>
  );
}

function MenuItem({
  className,
  onClick,
  children,
}: {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-hover-bg text-text-secondary hover:text-text-primary",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function MenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-border-subtle" />;
}
