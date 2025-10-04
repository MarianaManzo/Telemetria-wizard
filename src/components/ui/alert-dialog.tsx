import { Modal } from "antd";
import type { ModalProps } from "antd";
import {
  cloneElement,
  createContext,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PropsWithChildren,
  type ReactElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { fontSizes, lineHeights, radii, spacing, toPx } from "../../styles/tokens";
import { Button } from "./button";
import { cn } from "./utils";

type AlertDialogContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

function useAlertDialogContext(component: string) {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <AlertDialog>`);
  }
  return ctx;
}

export type AlertDialogProps = PropsWithChildren<{
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

export function AlertDialog({ open, defaultOpen, onOpenChange, children }: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
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

  const contextValue = useMemo<AlertDialogContextValue>(
    () => ({ open: actualOpen, setOpen }),
    [actualOpen, setOpen],
  );

  return <AlertDialogContext.Provider value={contextValue}>{children}</AlertDialogContext.Provider>;
}

function composeHandlers<E extends ReactMouseEvent>(
  theirs?: (event: E) => void,
  ours?: (event: E) => void,
) {
  return (event: E) => {
    theirs?.(event);
    if (!event.defaultPrevented) {
      ours?.(event);
    }
  };
}

type TriggerProps = PropsWithChildren<{ asChild?: boolean; onClick?: (event: ReactMouseEvent) => void }>;

export function AlertDialogTrigger({ children, asChild = false, onClick }: TriggerProps) {
  const ctx = useAlertDialogContext("AlertDialogTrigger");

  const handleClick = useCallback(
    (event: ReactMouseEvent) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        ctx.setOpen(true);
      }
    },
    [ctx, onClick],
  );

  if (asChild && children && (children as ReactElement).props) {
    const child = children as ReactElement;
    return cloneElement(child, {
      onClick: composeHandlers(child.props.onClick, handleClick),
    });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

export type AlertDialogContentProps = PropsWithChildren<
  Omit<ModalProps, "open" | "visible" | "onCancel" | "footer" | "children"> & { className?: string }
>;

export function AlertDialogContent({ className, children, style, styles, ...rest }: AlertDialogContentProps) {
  const ctx = useAlertDialogContext("AlertDialogContent");

  const handleCancel = useCallback(() => {
    ctx.setOpen(false);
    rest.onCancel?.();
  }, [ctx, rest]);

  const mergedStyle: CSSProperties = {
    borderRadius: toPx(radii.lg),
    overflow: "hidden",
    ...style,
  };

  const mergedStyles: ModalProps["styles"] = {
    ...styles,
    body: {
      padding: toPx(spacing.lg),
      ...(styles?.body ?? {}),
    },
  };

  return (
    <Modal
      open={ctx.open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      className={cn(className)}
      style={mergedStyle}
      styles={mergedStyles}
      {...rest}
    >
      {children}
    </Modal>
  );
}

export function AlertDialogHeader({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col", className)}
      style={{ gap: "var(--size-xs)", marginBottom: "var(--size-sm)", ...style }}
      {...props}
    />
  );
}

export function AlertDialogFooter({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col sm:flex-row sm:justify-end", className)}
      style={{ gap: "var(--size-xs)", marginTop: "var(--size-sm)", ...style }}
      {...props}
    />
  );
}

export function AlertDialogTitle({ className, style, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("font-semibold", className)}
      style={{ fontSize: toPx(fontSizes.lg), lineHeight: lineHeights.base, margin: 0, ...style }}
      {...props}
    />
  );
}

export function AlertDialogDescription({ className, style, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-muted-foreground", className)}
      style={{ fontSize: toPx(fontSizes.sm), lineHeight: lineHeights.base, margin: 0, ...style }}
      {...props}
    />
  );
}

export function AlertDialogAction({ className, asChild = false, onClick, children }: PropsWithChildren<{ className?: string; asChild?: boolean; onClick?: (event: ReactMouseEvent) => void }>) {
  const ctx = useAlertDialogContext("AlertDialogAction");

  const handleClick = useCallback(
    (event: ReactMouseEvent) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        ctx.setOpen(false);
      }
    },
    [ctx, onClick],
  );

  if (asChild && children && (children as ReactElement).props) {
    const child = children as ReactElement;
    return cloneElement(child, {
      onClick: composeHandlers(child.props.onClick, handleClick),
    });
  }

  return (
    <Button className={className} onClick={handleClick}>
      {children}
    </Button>
  );
}

export function AlertDialogCancel({ className, asChild = false, onClick, children }: PropsWithChildren<{ className?: string; asChild?: boolean; onClick?: (event: ReactMouseEvent) => void }>) {
  const ctx = useAlertDialogContext("AlertDialogCancel");

  const handleClick = useCallback(
    (event: ReactMouseEvent) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        ctx.setOpen(false);
      }
    },
    [ctx, onClick],
  );

  if (asChild && children && (children as ReactElement).props) {
    const child = children as ReactElement;
    return cloneElement(child, {
      onClick: composeHandlers(child.props.onClick, handleClick),
    });
  }

  return (
    <Button variant="outline" className={className} onClick={handleClick}>
      {children}
    </Button>
  );
}

export function AlertDialogOverlay({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>;
}

export function AlertDialogPortal({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>;
}
