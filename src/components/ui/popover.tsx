import { Popover as AntdPopover } from "antd";
import type { PopoverProps as AntdPopoverProps } from "antd";
import {
  createContext,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CSSProperties } from "react";
import { cn } from "./utils";

type PopoverContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
  content: ReactNode;
  setContent: (value: ReactNode) => void;
  placement: AntdPopoverProps["placement"];
  setPlacement: (value: AntdPopoverProps["placement"]) => void;
  overlayClassName?: string;
  setOverlayClassName: (value?: string) => void;
  overlayStyle?: React.CSSProperties;
  setOverlayStyle: (value?: React.CSSProperties) => void;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string) {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Popover>`);
  }
  return ctx;
}

export type PopoverProps = PropsWithChildren<{
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

export function Popover({ open, defaultOpen, onOpenChange, children }: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const [content, setContent] = useState<ReactNode>(null);
  const [placement, setPlacement] = useState<AntdPopoverProps["placement"]>("bottom");
  const [overlayClassName, setOverlayClassName] = useState<string | undefined>();
  const [overlayStyle, setOverlayStyle] = useState<CSSProperties | undefined>();

  const isControlled = open !== undefined;
  const actualOpen = isControlled ? open : internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  const contextValue = useMemo<PopoverContextValue>(
    () => ({
      open: actualOpen,
      setOpen,
      content,
      setContent,
      placement,
      setPlacement,
      overlayClassName,
      setOverlayClassName,
      overlayStyle,
      setOverlayStyle,
    }),
    [actualOpen, setOpen, content, placement, overlayClassName, overlayStyle],
  );

  return <PopoverContext.Provider value={contextValue}>{children}</PopoverContext.Provider>;
}

type PopoverTriggerProps = PropsWithChildren<{
  asChild?: boolean;
}> & Omit<AntdPopoverProps, "open" | "content" | "children" | "placement" | "overlayClassName" | "trigger" | "onOpenChange">;

export function PopoverTrigger({ children, asChild = false, ...props }: PopoverTriggerProps) {
  const ctx = usePopoverContext("PopoverTrigger");

  const triggerNode: ReactElement = asChild && children ? (children as ReactElement) : (
    <span className="inline-flex">{children}</span>
  );

  return (
    <AntdPopover
      trigger="click"
      open={ctx.open}
      onOpenChange={ctx.setOpen}
      content={ctx.content}
      placement={ctx.placement}
      overlayClassName={ctx.overlayClassName}
      overlayStyle={ctx.overlayStyle}
      {...props}
    >
      {triggerNode}
    </AntdPopover>
  );
}

type PopoverContentProps = PropsWithChildren<{
  className?: string;
  align?: "start" | "center" | "end";
  style?: CSSProperties;
}>;

export function PopoverContent({ className, align = "center", style, children }: PopoverContentProps) {
  const ctx = usePopoverContext("PopoverContent");

  useEffect(() => {
    ctx.setContent(
      <div className={cn(className)} style={style}>
        {children}
      </div>,
    );
    ctx.setPlacement(mapAlignToPlacement(align));
    ctx.setOverlayClassName(className);
    ctx.setOverlayStyle(style);
    return () => {
      ctx.setContent(null);
      ctx.setOverlayClassName(undefined);
      ctx.setOverlayStyle(undefined);
    };
  }, [ctx, children, className, align, style]);

  return null;
}

function mapAlignToPlacement(align: "start" | "center" | "end"): AntdPopoverProps["placement"] {
  switch (align) {
    case "start":
      return "bottomLeft";
    case "end":
      return "bottomRight";
    case "center":
    default:
      return "bottom";
  }
}

export function PopoverAnchor({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>;
}
