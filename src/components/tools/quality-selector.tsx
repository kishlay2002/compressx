"use client";

import { COMPRESSION_PRESETS } from "@/lib/constants";
import { CompressionPreset } from "@/types";
import { cn } from "@/lib/utils";
import { Gauge, Scale, Minimize2 } from "lucide-react";

interface QualitySelectorProps {
  value: CompressionPreset["value"];
  onChange: (value: CompressionPreset["value"]) => void;
}

const icons = {
  light: Gauge,
  balanced: Scale,
  maximum: Minimize2,
};

export function QualitySelector({ value, onChange }: QualitySelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {COMPRESSION_PRESETS.map((preset) => {
        const Icon = icons[preset.value];
        const isActive = value === preset.value;
        return (
          <button
            key={preset.value}
            onClick={() => onChange(preset.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all text-center",
              isActive
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-transparent bg-muted/50 hover:border-muted-foreground/20 hover:bg-muted"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            <div>
              <p className={cn("text-sm font-semibold", isActive && "text-primary")}>
                {preset.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {preset.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
