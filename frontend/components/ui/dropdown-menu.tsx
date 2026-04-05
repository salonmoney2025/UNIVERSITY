"use client"

import * as React from "react"

export interface DropdownMenuProps {
  children: React.ReactNode
}

export const DropdownMenu = ({ children }: DropdownMenuProps) => {
  return <div className="relative inline-block text-left">{children}</div>
}

export const DropdownMenuTrigger = ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => {
  return <button type="button" {...props}>{children}</button>
}

export const DropdownMenuContent = ({ children, align = "end", ...props }: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }) => {
  const alignClass = align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2"

  return (
    <div
      className={`absolute ${alignClass} mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50`}
      {...props}
    >
      <div className="py-1" role="menu">
        {children}
      </div>
    </div>
  )
}

export const DropdownMenuItem = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
      role="menuitem"
      {...props}
    >
      {children}
    </div>
  )
}

export const DropdownMenuLabel = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className="px-4 py-2 text-sm font-semibold text-gray-900"
      {...props}
    >
      {children}
    </div>
  )
}

export const DropdownMenuSeparator = () => {
  return <div className="h-px my-1 bg-gray-200" />
}
