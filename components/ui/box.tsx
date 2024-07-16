import * as React from "react";

import { cn } from "./cn";
import { dialogTitleStaticClasses } from "./dialog";

const Box = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative border bg-background text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
));
Box.displayName = "Boc";

const BoxHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4", className)}
    {...props}
  />
));
BoxHeader.displayName = "BoxHeader";

const BoxTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(dialogTitleStaticClasses, className)}
      {...props}
    />
  );
});
BoxTitle.displayName = "BoxTitle";

const BoxDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-500", className)}
    {...props}
  />
));
BoxDescription.displayName = "BoxDescription";

const BoxContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
));
BoxContent.displayName = "BoxContent";

const BoxFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0", className)}
    {...props}
  />
));
BoxFooter.displayName = "BoxFooter";

export {
  Box,
  BoxContent,
  BoxDescription,
  BoxFooter,
  BoxHeader,
  BoxTitle,
};
