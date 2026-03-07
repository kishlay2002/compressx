"use client";

import { useState, useCallback, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatBytes } from "@/lib/constants";
import { Target, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface TargetSizeSelectorProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  targetSizeKB: number;
  onTargetSizeChange: (sizeKB: number) => void;
  originalSizeBytes?: number;
}

const PRESET_SIZES = [
  { label: "50 KB", value: 50 },
  { label: "100 KB", value: 100 },
  { label: "200 KB", value: 200 },
  { label: "500 KB", value: 500 },
  { label: "1 MB", value: 1024 },
  { label: "2 MB", value: 2048 },
];

export function TargetSizeSelector({
  enabled,
  onEnabledChange,
  targetSizeKB,
  onTargetSizeChange,
  originalSizeBytes,
}: TargetSizeSelectorProps) {
  const [inputValue, setInputValue] = useState(String(targetSizeKB));

  useEffect(() => {
    setInputValue(String(targetSizeKB));
  }, [targetSizeKB]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      const num = Number(val);
      if (!isNaN(num) && num > 0 && num <= 51200) {
        onTargetSizeChange(Math.round(num));
      }
    },
    [onTargetSizeChange]
  );

  const handleSliderChange = useCallback(
    (value: number | readonly number[]) => {
      const kb = Array.isArray(value) ? value[0] : value;
      onTargetSizeChange(kb);
      setInputValue(String(kb));
    },
    [onTargetSizeChange]
  );

  // Compute slider max based on original file size or default 10MB
  const maxKB = originalSizeBytes
    ? Math.min(Math.round(originalSizeBytes / 1024), 10240)
    : 10240;

  return (
    <div className={cn(
      "rounded-2xl border bg-card p-5 space-y-4 transition-all duration-300",
      enabled && "border-primary/20 bg-primary/[0.02] shadow-sm"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "rounded-lg p-1.5 transition-colors",
            enabled ? "bg-primary/10" : "bg-muted"
          )}>
            <Target className={cn("h-4 w-4", enabled ? "text-primary" : "text-muted-foreground")} />
          </div>
          <Label htmlFor="target-toggle" className="text-sm font-semibold cursor-pointer">
            Target File Size
          </Label>
        </div>
        <Switch
          id="target-toggle"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      {enabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Slider
                value={[targetSizeKB]}
                onValueChange={handleSliderChange}
                min={10}
                max={maxKB}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>10 KB</span>
                <span>{formatBytes(maxKB * 1024)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Input
                type="number"
                value={inputValue}
                onChange={handleInputChange}
                className="w-20 h-9 text-sm text-center rounded-lg"
                min={10}
                max={51200}
              />
              <span className="text-xs text-muted-foreground font-medium">KB</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_SIZES.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  onTargetSizeChange(preset.value);
                  setInputValue(String(preset.value));
                }}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all duration-200",
                  targetSizeKB === preset.value
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-muted-foreground/20 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/50"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {originalSizeBytes && (
            <div className="flex items-start gap-2.5 rounded-xl bg-gradient-to-r from-primary/5 to-violet-500/5 border border-primary/10 p-3.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
              <p>
                Original size: <strong className="text-foreground">{formatBytes(originalSizeBytes)}</strong>
                . Target: <strong className="text-primary">{formatBytes(targetSizeKB * 1024)}</strong>
                {" "}({Math.round((1 - (targetSizeKB * 1024) / originalSizeBytes) * 100)}% reduction).
                The compressor will iteratively adjust quality and resolution to
                reach as close to the target as possible.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
