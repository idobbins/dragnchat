"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Base Command component (same as shadcn)
function VirtualizedCommand({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className,
      )}
      {...props}
    />
  );
}

// Command Dialog (same as shadcn)
function VirtualizedCommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
      >
        <VirtualizedCommand className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </VirtualizedCommand>
      </DialogContent>
    </Dialog>
  );
}

// Command Input (same as shadcn)
function VirtualizedCommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

// Virtual item types
interface VirtualCommandItem {
  type: 'group' | 'item';
  id: string;
  groupHeading?: string;
  content?: React.ReactNode;
  value?: string;
  onSelect?: () => void;
  disabled?: boolean;
}

// Virtualized Command List
interface VirtualizedCommandListProps {
  items: VirtualCommandItem[];
  height?: number;
  itemHeight?: number;
  groupHeaderHeight?: number;
  className?: string;
  emptyMessage?: string;
}

function VirtualizedCommandList({
  items,
  height = 300,
  itemHeight = 48,
  groupHeaderHeight = 32,
  className,
  emptyMessage = "No results found.",
}: VirtualizedCommandListProps) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = items[index];
      return item?.type === 'group' ? groupHeaderHeight : itemHeight;
    },
    overscan: 5,
  });

  if (items.length === 0) {
    return (
      <div
        data-slot="command-empty"
        className="py-6 text-center text-sm"
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      data-slot="command-list"
      className={cn(
        "scroll-py-1 overflow-x-hidden overflow-y-auto",
        className,
      )}
      style={{ height: `${height}px` }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          if (!item) return null;

          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {item.type === 'group' ? (
                <VirtualizedCommandGroup heading={item.groupHeading} />
              ) : (
                <VirtualizedCommandItem
                  value={item.value}
                  onSelect={item.onSelect}
                  disabled={item.disabled}
                >
                  {item.content}
                </VirtualizedCommandItem>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Command Empty (same as shadcn)
function VirtualizedCommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  );
}

// Command Group (same as shadcn)
function VirtualizedCommandGroup({
  className,
  heading,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group> & {
  heading?: string;
}) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    >
      {heading && (
        <div data-slot="command-group-heading" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {heading}
        </div>
      )}
    </CommandPrimitive.Group>
  );
}

// Command Separator (same as shadcn)
function VirtualizedCommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

// Command Item (same as shadcn)
function VirtualizedCommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

// Command Shortcut (same as shadcn)
function VirtualizedCommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  VirtualizedCommand,
  VirtualizedCommandDialog,
  VirtualizedCommandInput,
  VirtualizedCommandList,
  VirtualizedCommandEmpty,
  VirtualizedCommandGroup,
  VirtualizedCommandItem,
  VirtualizedCommandShortcut,
  VirtualizedCommandSeparator,
  type VirtualCommandItem,
};
