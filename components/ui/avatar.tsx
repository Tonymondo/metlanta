'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'

/* ── Root ────────────────────────────────────────────────────────────────── */

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

/* ── Image ───────────────────────────────────────────────────────────────── */

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

/* ── Fallback ────────────────────────────────────────────────────────────── */

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full',
      'bg-[#1a1a1a] text-[#E03030] font-bold text-sm select-none',
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

/* ── Badge (online indicator dot) ────────────────────────────────────────── */

const AvatarBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full',
      'ring-2 ring-[#080808]',
      'bg-[#22c55e]',
      className
    )}
    {...props}
  />
))
AvatarBadge.displayName = 'AvatarBadge'

/* ── Group ───────────────────────────────────────────────────────────────── */

const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center [&>*]:-ml-2 [&>*:first-child]:ml-0', className)}
    {...props}
  />
))
AvatarGroup.displayName = 'AvatarGroup'

/* ── Group count bubble ──────────────────────────────────────────────────── */

const AvatarGroupCount = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
      'bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)]',
      'text-[11px] font-bold text-[rgba(255,255,255,0.6)]',
      'ring-2 ring-[#080808]',
      className
    )}
    {...props}
  />
))
AvatarGroupCount.displayName = 'AvatarGroupCount'

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount }
