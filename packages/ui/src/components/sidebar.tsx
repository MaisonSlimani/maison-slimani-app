'use client'

/**
 * Sidebar UI Primitive
 * Refactored to adhere to the 300-line rule via modular sub-modules.
 */

export * from "./sidebar/context"
export * from "./sidebar/provider"
export * from "./sidebar/elements"
export * from "./sidebar/menu"

// Re-export utility components that were too small for their own files
import * as React from "react"
import { cn } from "@maison/shared"
import { Separator } from "./separator"

export const SidebarSeparator = React.forwardRef<React.ElementRef<typeof Separator>, React.ComponentProps<typeof Separator>>(
  ({ className, ...props }, ref) => (
    <Separator ref={ref} data-sidebar="separator" className={cn("mx-2 w-auto bg-sidebar-border", className)} {...props} />
  )
)
SidebarSeparator.displayName = "SidebarSeparator"

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
  )
)
SidebarGroup.displayName = "SidebarGroup"

export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="group-label" className={cn("flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 transition-opacity group-data-[collapsible=icon]:opacity-0", className)} {...props} />
  )
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"
