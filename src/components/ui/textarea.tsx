import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full px-3 py-3 text-[14px] border border-gray-300 rounded-md bg-white text-gray-900 transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground resize-none field-sizing-content min-h-16",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };