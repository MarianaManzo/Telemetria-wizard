import { Tooltip as AntdTooltip } from "antd";
import type { TooltipProps as AntdTooltipProps } from "antd";
import {
  createContext,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type TooltipContextValue = {
  title: ReactNode;
  setTitle: (value: ReactNode) => void;
  placement: AntdTooltipProps["placement"];
  setPlacement: (value: AntdTooltipProps["placement"]) => void;
  overlayClassName?: string;
  setOverlayClassName: (value?: string) => void;
};

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext(component: string) {
  const ctx = useContext(TooltipContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Tooltip>`);
  }
  return ctx;
}

export function TooltipProvider({ children }: PropsWithChildren<{ delayDuration?: number }>) {
  return <>{children}</>;
}

export function Tooltip({ children }: PropsWithChildren<unknown>) {
  const [title, setTitle] = useState<ReactNode>(null);
  const [placement, setPlacement] = useState<AntdTooltipProps["placement"]>("top");
  const [overlayClassName, setOverlayClassName] = useState<string | undefined>();

  const contextValue = useMemo<TooltipContextValue>(
    () => ({ title, setTitle, placement, setPlacement, overlayClassName, setOverlayClassName }),
    [title, placement, overlayClassName],
  );

  return <TooltipContext.Provider value={contextValue}>{children}</TooltipContext.Provider>;
}

type TooltipTriggerProps = PropsWithChildren<{
  asChild?: boolean;
}> & Omit<AntdTooltipProps, "title" | "placement" | "overlayClassName" | "children">;

export function TooltipTrigger({ children, asChild = false, ...props }: TooltipTriggerProps) {
  const ctx = useTooltipContext("TooltipTrigger");

  const triggerNode: ReactElement = asChild && children ? (children as ReactElement) : (
    <span className="inline-flex">{children}</span>
  );

  return (
    <AntdTooltip
      title={ctx.title}
      placement={ctx.placement}
      overlayClassName={ctx.overlayClassName}
      {...props}
    >
      {triggerNode}
    </AntdTooltip>
  );
}

type TooltipContentProps = PropsWithChildren<{
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}>;

export function TooltipContent({ className, side = "top", children }: TooltipContentProps) {
  const ctx = useTooltipContext("TooltipContent");

  useEffect(() => {
    ctx.setTitle(children);
    ctx.setPlacement(sideMap[side] ?? "top");
    ctx.setOverlayClassName(className);
    return () => {
      ctx.setTitle(null);
      ctx.setOverlayClassName(undefined);
    };
  }, [ctx, children, className, side]);

  return null;
}

const sideMap: Partial<Record<string, AntdTooltipProps["placement"]>> = {
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
};
