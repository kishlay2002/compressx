"use client";

import { useState, useCallback } from "react";
import { Dropzone } from "@/components/tools/dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { compressImageClient } from "@/lib/compression/image-client";
import { formatBytes } from "@/lib/constants";
import {
  ArrowRightLeft,
  Lock,
  RotateCcw,
  Loader2,
  Download,
  FileImage,
} from "lucide-react";
import { toast } from "sonner";

const OUTPUT_FORMATS = [
  { value: "image/jpeg", label: "JPEG", ext: ".jpg" },
  { value: "image/png", label: "PNG", ext: ".png" },
  { value: "image/webp", label: "WebP", ext: ".webp" },
];

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState("image/webp");
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setConvertedBlob(null);
    setError(null);
  }, []);

  const convert = useCallback(async () => {
    if (!file) return;
    setIsConverting(true);
    setError(null);

    try {
      const result = await compressImageClient(file, 0.92, 4096, 4096, outputFormat);
      setConvertedBlob(result.blob);
      const fmt = OUTPUT_FORMATS.find((f) => f.value === outputFormat);
      toast.success(`Converted to ${fmt?.label || "new format"} successfully`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Conversion failed";
      setError(msg);
      toast.error(msg);
    }

    setIsConverting(false);
  }, [file, outputFormat]);

  const download = useCallback(() => {
    if (!convertedBlob || !file) return;
    const fmt = OUTPUT_FORMATS.find((f) => f.value === outputFormat);
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = file.name.replace(/\.[^.]+$/, "");
    a.download = `${baseName}${fmt?.ext || ".jpg"}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [convertedBlob, file, outputFormat]);

  const reset = useCallback(() => {
    setFile(null);
    setConvertedBlob(null);
    setError(null);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="inline-flex rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 p-4 mb-5">
          <ArrowRightLeft className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Convert Format</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Convert images between JPEG, PNG, and WebP formats
        </p>
        <Badge variant="secondary" className="mt-4 px-4 py-1.5 border border-green-500/20 bg-green-500/5 text-green-700 dark:text-green-400">
          <Lock className="h-3 w-3 mr-1.5" />
          Processed locally — files never leave your device
        </Badge>
      </div>

      {!file ? (
        <Dropzone
          accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"] }}
          maxSize={25 * 1024 * 1024}
          multiple={false}
          onFiles={handleFiles}
          label="Drop your image here"
          description="Supports JPEG, PNG, WebP, GIF, BMP"
        />
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2">
              <FileImage className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)} · {file.type}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Convert to
            </label>
            <Select value={outputFormat} onValueChange={(v) => v && setOutputFormat(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTPUT_FORMATS.map((fmt) => (
                  <SelectItem key={fmt.value} value={fmt.value}>
                    {fmt.label} ({fmt.ext})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {convertedBlob && (
            <div className="rounded-2xl border-2 border-orange-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Conversion Complete</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatBytes(file.size)} → {formatBytes(convertedBlob.size)}
                  </p>
                </div>
                <Button onClick={download} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            {!convertedBlob && (
              <Button
                onClick={convert}
                size="lg"
                className="flex-1"
                disabled={isConverting}
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert"
                )}
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
