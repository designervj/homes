"use client";

import { useEffect, useState, useTransition } from "react";
import { SafeImage as Image } from "@/components/shared/SafeImage";
import {
  ArrowUpDown,
  FileText,
  ImageIcon,
  Loader2,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  deletePropertyMedia,
  reorderPropertyMedia,
  setPropertyCoverImage,
  uploadPropertyMedia,
} from "@/lib/db/actions/property-media.actions";
import { cn } from "@/lib/utils";
import type { IMediaAsset } from "@/types";

const MEDIA_TYPES: Array<{ value: IMediaAsset["type"]; label: string }> = [
  { value: "image", label: "Image" },
  { value: "floorplan", label: "Floor Plan" },
  { value: "brochure", label: "Brochure" },
  { value: "video", label: "Video" },
];

function isPreviewableImage(asset: IMediaAsset) {
  return ["image", "floorplan"].includes(asset.type) && !asset.url.toLowerCase().endsWith(".pdf");
}

function sortAssets(assets: IMediaAsset[]) {
  return [...assets].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
}

function moveAsset(assets: IMediaAsset[], sourceUrl: string, targetUrl: string) {
  const nextAssets = [...assets];
  const sourceIndex = nextAssets.findIndex((asset) => asset.url === sourceUrl);
  const targetIndex = nextAssets.findIndex((asset) => asset.url === targetUrl);

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return nextAssets;
  }

  const [movedAsset] = nextAssets.splice(sourceIndex, 1);
  nextAssets.splice(targetIndex, 0, movedAsset);
  return nextAssets.map((asset, index) => ({ ...asset, order: index }));
}

export function MediaGallery({
  propertyId,
  initialAssets,
  onChange,
}: {
  propertyId?: string;
  initialAssets: IMediaAsset[];
  onChange: (assets: IMediaAsset[]) => void;
}) {
  const [assets, setAssets] = useState(() => sortAssets(initialAssets));
  const [isPending, startTransition] = useTransition();
  const [assetType, setAssetType] = useState<IMediaAsset["type"]>("image");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [draggedUrl, setDraggedUrl] = useState<string | null>(null);

  useEffect(() => {
    setAssets(sortAssets(initialAssets));
  }, [initialAssets]);

  const syncAssets = (nextAssets: IMediaAsset[]) => {
    const sortedAssets = sortAssets(nextAssets);
    setAssets(sortedAssets);
    onChange(sortedAssets);
  };

  const handleUpload = () => {
    if (!propertyId) {
      toast.error("Create the property first to enable uploads");
      return;
    }

    if (!selectedFile) {
      toast.error("Choose a file to upload");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", selectedFile);
      formData.set("type", assetType);
      if (caption.trim()) {
        formData.set("caption", caption.trim());
      }

      const res = await uploadPropertyMedia(propertyId, formData);

      if (res.success && res.data) {
        syncAssets(res.data);
        setCaption("");
        setSelectedFile(null);
        setInputKey((current) => current + 1);
        toast.success(res.message ?? "Media uploaded");
        return;
      }

      toast.error(res.error ?? "Upload failed");
    });
  };

  const handleDelete = (assetUrl: string) => {
    if (!propertyId) return;

    startTransition(async () => {
      const res = await deletePropertyMedia(propertyId, assetUrl);

      if (res.success && res.data) {
        syncAssets(res.data);
        toast.success(res.message ?? "Media deleted");
        return;
      }

      toast.error(res.error ?? "Delete failed");
    });
  };

  const handleSetCover = (assetUrl: string) => {
    if (!propertyId) return;

    startTransition(async () => {
      const res = await setPropertyCoverImage(propertyId, assetUrl);

      if (res.success && res.data) {
        syncAssets(res.data);
        toast.success(res.message ?? "Cover updated");
        return;
      }

      toast.error(res.error ?? "Cover update failed");
    });
  };

  const handleDrop = (targetUrl: string) => {
    if (!propertyId || !draggedUrl || draggedUrl === targetUrl) {
      setDraggedUrl(null);
      return;
    }

    const nextAssets = moveAsset(assets, draggedUrl, targetUrl);
    syncAssets(nextAssets);
    setDraggedUrl(null);

    startTransition(async () => {
      const res = await reorderPropertyMedia(
        propertyId,
        nextAssets.map((asset) => asset.url)
      );

      if (res.success && res.data) {
        syncAssets(res.data);
        return;
      }

      toast.error(res.error ?? "Could not save the new order");
      setAssets(sortAssets(initialAssets));
      onChange(sortAssets(initialAssets));
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
              Upload File
            </label>
            <input
              key={inputKey}
              type="file"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
            />
          </div>
          <div className="sm:w-40">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
              Media Type
            </label>
            <select
              value={assetType}
              onChange={(event) => setAssetType(event.target.value as IMediaAsset["type"])}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
            >
              {MEDIA_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
              Caption
            </label>
            <input
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Optional caption"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
            />
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!propertyId || isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-light disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </button>
        </div>
        {!propertyId && (
          <p className="mt-3 text-xs text-muted-foreground">
            Save the property once, then come back here to upload and manage the gallery.
          </p>
        )}
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/70 p-8 text-center">
          <ImageIcon className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No media uploaded yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload images, floor plans, brochures, or short video clips for this listing.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <div
              key={asset.url}
              draggable={!!propertyId}
              onDragStart={() => setDraggedUrl(asset.url)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(asset.url)}
              className={cn(
                "overflow-hidden rounded-xl border border-border bg-card transition-colors",
                draggedUrl === asset.url && "opacity-70"
              )}
            >
              <div className="relative h-40 bg-background">
                {isPreviewableImage(asset) ? (
                  <Image
                    src={asset.url}
                    alt={asset.caption ?? asset.type}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <FileText className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <span className="rounded-full bg-background/90 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-foreground shadow-sm">
                    {asset.type.replace(/_/g, " ")}
                  </span>
                  {asset.isCover && (
                    <span className="rounded-full bg-primary/90 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-primary-foreground shadow-sm">
                      Cover
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {asset.caption || asset.url.split("/").pop()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Drag to reorder
                    </p>
                  </div>
                  <ArrowUpDown className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-2">
                  {asset.type === "image" && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(asset.url)}
                      disabled={isPending || asset.isCover}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <Star className={cn("h-3.5 w-3.5", asset.isCover && "fill-primary text-primary")} />
                      {asset.isCover ? "Cover" : "Set Cover"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(asset.url)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
