import { Skeleton as AntdSkeleton } from "antd";
import type { SkeletonProps as AntdSkeletonProps } from "antd";
import { cn } from "./utils";

export function Skeleton({ className, ...props }: AntdSkeletonProps) {
  return <AntdSkeleton active className={cn(className)} {...props} />;
}
