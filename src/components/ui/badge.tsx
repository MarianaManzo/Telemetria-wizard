import { Tag } from "antd";
import type { TagProps } from "antd";
import { forwardRef } from "react";
import { cn } from "./utils";

type Variant = "default" | "secondary" | "destructive" | "outline";

type BadgeProps = Omit<TagProps, "color"> & {
  variant?: Variant;
};

const variantToColor: Record<Variant, TagProps["color"] | undefined> = {
  default: "blue",
  secondary: "default",
  destructive: "error",
  outline: undefined,
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", className, style, color, ...rest }, ref) => {
    const resolvedColor = color ?? variantToColor[variant];

    return (
      <Tag
        ref={ref}
        color={resolvedColor}
        className={cn("inline-flex items-center gap-1 rounded-[4px]", className)}
        style={{ borderRadius: 4, ...(style || {}) }}
        {...rest}
      />
    );
  }
);

Badge.displayName = "Badge";
