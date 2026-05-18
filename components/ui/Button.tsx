"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bingo-green/30",
  {
    variants: {
      variant: {
        primary: "bg-bingo-black text-white hover:bg-bingo-charcoal active:scale-[.98] bingo-shadow",
        green: "bg-bingo-green text-bingo-black hover:bg-bingo-green-light active:scale-[.98] bingo-shadow",
        outline: "bg-white border-2 border-bingo-gray-200 hover:border-bingo-black text-bingo-black",
        ghost: "hover:bg-bingo-gray-100 text-bingo-black",
        soft: "bg-bingo-gray-100 hover:bg-bingo-gray-200 text-bingo-black",
        danger: "bg-status-red text-white hover:bg-red-600 active:scale-[.98]",
        link: "text-bingo-green-dark underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-base",
        lg: "h-14 px-6 text-lg",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
    );
  }
);
Button.displayName = "Button";
