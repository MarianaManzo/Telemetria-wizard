import { Layout } from "antd";
import type { ContentProps } from "antd/es/layout/layout";
import type { HTMLAttributes } from "react";
import { cn } from "./utils";

const { Content } = Layout;

type ScrollAreaProps = ContentProps;

type ScrollBarProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "vertical" | "horizontal";
};

export function ScrollArea({ className, style, children, ...props }: ScrollAreaProps) {
  return (
    <Content
      className={cn("relative", className)}
      style={{ overflow: "auto", ...style }}
      {...props}
    >
      {children}
    </Content>
  );
}

export function ScrollBar({ className, style, orientation = "vertical", ...props }: ScrollBarProps) {
  return (
    <div
      className={cn(
        "pointer-events-none select-none",
        orientation === "vertical" ? "h-full w-0" : "w-full h-0",
        className,
      )}
      style={style}
      {...props}
    />
  );
}
