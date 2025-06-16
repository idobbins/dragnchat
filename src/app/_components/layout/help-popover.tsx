"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle, MousePointer2 } from "lucide-react";

export function HelpPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <HelpCircle className="size-6 hover:cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <h4 className="font-medium">Application Instructions</h4>
          <div className="space-y-2">
            <p>
              Set up your OpenRouter API key at{" "}
              <a
                href="https://openrouter.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                OpenRouter
              </a>
              .
            </p>
            <div className="flex items-center gap-2">
              <MousePointer2 className="h-4 w-4" />
              <p>Right click to add nodes.</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
