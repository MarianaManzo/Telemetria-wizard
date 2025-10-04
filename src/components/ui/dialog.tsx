import { Modal } from "antd";
import type { ModalProps } from "antd";
import {
  cloneElement,
  createContext,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { fontSizes, lineHeights, radii, spacing, toPx } from "../../styles/tokens";
import { cn } from "./utils";

type DialogContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(component: string) {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Dialog>`);
  }
  return ctx;
}

export type DialogProps = PropsWithChildren<{
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

export function Dialog({ open, defaultOpen, onOpenChange, children }: DialogProps) {
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

  const contextValue = useMemo<DialogContextValue>(
    () => ({ open: actualOpen, setOpen }),
    [actualOpen, setOpen],
  );

  return <DialogContext.Provider value={contextValue}>{children}</DialogContext.Provider>;
}

type TriggerProps = PropsWithChildren<{
  asChild?: boolean;
  onClick?: (event: ReactMouseEvent) => void;
}>;

function composeEventHandlers<E extends ReactMouseEvent>(
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

export function DialogTrigger({ children, asChild = false, onClick }: TriggerProps) {
  const ctx = useDialogContext("DialogTrigger");

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
      onClick: composeEventHandlers(child.props.onClick, handleClick),
    });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

export type DialogContentProps = PropsWithChildren<
  Omit<ModalProps, "open" | "visible" | "onCancel" | "footer" | "children"> & { className?: string }
>;

export function DialogContent({ className, children, style, styles, ...props }: DialogContentProps) {
  const ctx = useDialogContext("DialogContent");

  const handleCancel = useCallback(() => {
    ctx.setOpen(false);
    props.onCancel?.();
  }, [ctx, props]);

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
      {...props}
    >
      {children}
    </Modal>
  );
}

type DialogCloseProps = PropsWithChildren<{
  asChild?: boolean;
  onClick?: (event: ReactMouseEvent) => void;
}>;

export function DialogClose({ children, asChild = false, onClick }: DialogCloseProps) {
  const ctx = useDialogContext("DialogClose");

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
      onClick: composeEventHandlers(child.props.onClick, handleClick),
    });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

export function DialogHeader({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col", className)}
      style={{ gap: "var(--size-xs)", marginBottom: "var(--size-sm)", ...style }}
      {...props}
    />
  );
}

export function DialogFooter({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col sm:flex-row sm:justify-end", className)}
      style={{ gap: "var(--size-xs)", marginTop: "var(--size-sm)", ...style }}
      {...props}
    />
  );
}

export function DialogTitle({ className, style, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("font-semibold", className)}
      style={{ fontSize: toPx(fontSizes.lg), lineHeight: lineHeights.base, margin: 0, ...style }}
      {...props}
    />
  );
}

export function DialogDescription({ className, style, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-muted-foreground", className)}
      style={{ fontSize: toPx(fontSizes.sm), lineHeight: lineHeights.base, margin: 0, ...style }}
      {...props}
    />
  );
}

export function DialogPortal({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>;
}

export function DialogOverlay({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>;
}
