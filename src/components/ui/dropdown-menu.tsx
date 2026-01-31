"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null)

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu")
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement).props.onClick?.(e);
        context.setOpen(!context.open);
      }
    })
  }

  return (
    <button
      ref={ref}
      onClick={() => context.setOpen(!context.open)}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" | "center" }
>(({ className, align = "center", ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        // Use a slight delay or check if the click was on the trigger to avoid immediate close
        // But since the trigger is outside the content ref, simple contains check works usually
        // if the trigger is clicked, it toggles. If we close here, it might reopen.
        // But since we use !open in trigger, if we set open=false here, then trigger click sets open=true.
        // We need to be careful.
        // Actually, for this simple implementation, if we click outside, we close.
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
             // Check if click is on trigger? No easy way without ref to trigger.
             // But if we click trigger, trigger onClick fires.
             // If we rely on bubbling, order matters.
             // Let's just rely on the fact that if we click outside, we close.
             // If we click the trigger, the trigger's onClick will fire.
             // If the trigger is outside, we close, then trigger opens. That's a flicker or just works.
             // A better way is to not close if target is inside the root dropdown container.
             // But the root container is just a div.
             // Let's look at the structure: <div relative> <Trigger> <Content absolute> </div>
             // If I click Trigger, it is inside the root div.
             // So I should put the ref on the root div in DropdownMenu?
             // But DropdownMenu component doesn't expose ref easily.
             
             // Simplest fix: Just check if the click is inside the nearest .relative.inline-block (our root)
             const root = menuRef.current?.closest('.relative.inline-block');
             if (root && root.contains(event.target as Node)) {
                 return; // Click inside the dropdown component (Trigger or Content)
             }
             context?.setOpen(false)
        }
    }
    if (context?.open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [context?.open])

  if (!context?.open) return null

  return (
    <div
      ref={menuRef}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
        className
      )}
      {...props}
    />
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
