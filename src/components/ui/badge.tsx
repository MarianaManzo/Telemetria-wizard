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
  ({ variant = "default", className, ...props }, ref) => {
    const color = props.color ?? variantToColor[variant];

    return <Tag ref={ref} color={color} className={cn(className)} {...props} />;
  },
);

Badge.displayName = "Badge";
