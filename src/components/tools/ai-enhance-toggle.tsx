"use client";

import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Sparkles, Eye, EyeOff, ExternalLink } from "lucide-react";
import type { AIEnhanceConfig } from "@/lib/compression/ai-enhance";

interface AIEnhanceToggleProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  config: AIEnhanceConfig | null;
  onConfigChange: (config: AIEnhanceConfig | null) => void;
}

export function AIEnhanceToggle({
  enabled,
  onEnabledChange,
  config,
  onConfigChange,
}: AIEnhanceToggleProps) {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState(config?.apiKey || "");

  const handleToggle = useCallback(
    (checked: boolean) => {
      onEnabledChange(checked);
      if (checked && apiKey) {
        onConfigChange({ provider: "replicate", apiKey });
      } else if (!checked) {
        onConfigChange(null);
      }
    },
    [onEnabledChange, onConfigChange, apiKey]
  );

  const handleKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const key = e.target.value;
      setApiKey(key);
      if (enabled && key) {
        onConfigChange({ provider: "replicate", apiKey: key });
      } else {
        onConfigChange(null);
      }
    },
    [enabled, onConfigChange]
  );

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-5 space-y-4 transition-all duration-300",
        enabled &&
          "border-violet-500/20 bg-gradient-to-r from-violet-500/[0.03] to-purple-500/[0.03] shadow-sm"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              enabled
                ? "bg-gradient-to-br from-violet-500/20 to-purple-500/20"
                : "bg-muted"
            )}
          >
            <Sparkles
              className={cn(
                "h-4 w-4",
                enabled ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"
              )}
            />
          </div>
          <div>
            <Label
              htmlFor="ai-toggle"
              className="text-sm font-semibold cursor-pointer"
            >
              AI Text Enhancement
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Powered by Real-ESRGAN via Replicate
            </p>
          </div>
        </div>
        <Switch
          id="ai-toggle"
          checked={enabled}
          onCheckedChange={handleToggle}
        />
      </div>

      {enabled && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Replicate API Key
            </Label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={handleKeyChange}
                placeholder="r8_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="pr-10 text-sm h-9 rounded-lg font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-violet-500/5 border border-violet-500/10 p-3 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-violet-500" />
            <div className="space-y-1.5">
              <p>
                AI super-resolution upscales each page using neural networks,
                making text significantly sharper after compression.
              </p>
              <p>
                <strong className="text-foreground">Cost:</strong> ~$0.002 per
                page (~$0.02 for a 10-page PDF)
              </p>
              <a
                href="https://replicate.com/account/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline font-medium"
              >
                Get your API key
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {apiKey && (
            <div className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-700 dark:text-green-400 font-medium">
                AI enhancement will be applied during compression
              </span>
            </div>
          )}

          {!apiKey && (
            <div className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                Enter API key to enable AI enhancement
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
