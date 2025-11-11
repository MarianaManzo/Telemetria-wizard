import { Dropdown } from "antd";
import type { DropdownProps, MenuProps } from "antd";
import {
  createContext,
  type MouseEvent as ReactMouseEvent,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "./utils";

type MenuItemType = NonNullable<MenuProps["items"]>[number];

type DropdownMenuContextValue = {
  items: MenuItemType[];
  registerItem: (item: MenuItemType, handler?: (event: MouseEvent) => void) => void;
  unregisterItem: (key: React.Key) => void;
  overlayClassName?: string;
  setOverlayClassName: (value?: string) => void;
  placement: DropdownProps["placement"];
  setPlacement: (value: DropdownProps["placement"]) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  handlers: React.MutableRefObject<Map<string, (event: MouseEvent) => void>>;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(component: string) {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <DropdownMenu>`);
  }
  return ctx;
}

type MouseEvent = globalThis.MouseEvent;

type DropdownMenuProps = PropsWithChildren<unknown>;

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [overlayClassName, setOverlayClassName] = useState<string | undefined>();
  const [placement, setPlacement] = useState<DropdownProps["placement"]>("bottomLeft");
  const [open, setOpen] = useState(false);
  const handlers = useRef(new Map<string, (event: MouseEvent) => void>());

  const registerItem = useCallback(
    (item: MenuItemType, handler?: (event: MouseEvent) => void) => {
      if (!item || item.key === undefined) {
        return;
      }

      setItems(prev => {
        const existingIndex = prev.findIndex(prevItem => prevItem?.key === item.key);
        if (existingIndex === -1) {
          return [...prev, item];
        }
        const next = [...prev];
        next[existingIndex] = item;
        return next;
      });

      const key = String(item.key);
      if (handler) {
        handlers.current.set(key, handler);
      } else {
        handlers.current.delete(key);
      }
    },
    [],
  );

  const unregisterItem = useCallback((key: React.Key) => {
    setItems(prev => prev.filter(item => item?.key !== key));
    handlers.current.delete(String(key));
  }, []);

  const value = useMemo<DropdownMenuContextValue>(
    () => ({
      items,
      registerItem,
      unregisterItem,
      overlayClassName,
      setOverlayClassName,
      placement,
      setPlacement,
      open,
      setOpen,
      handlers,
    }),
    [items, registerItem, unregisterItem, overlayClassName, placement, open],
  );

  return <DropdownMenuContext.Provider value={value}>{children}</DropdownMenuContext.Provider>;
}

type DropdownMenuTriggerProps = PropsWithChildren<{
  asChild?: boolean;
  disabled?: boolean;
}>;

export function DropdownMenuTrigger({ children, asChild = false, disabled }: DropdownMenuTriggerProps) {
  const ctx = useDropdownMenuContext("DropdownMenuTrigger");

  const menuProps = useMemo<MenuProps>(
    () => ({
      items: ctx.items,
      onClick: info => {
        const handler = ctx.handlers.current.get(String(info.key));
        if (handler) {
          handler(info.domEvent as MouseEvent);
        }
        ctx.setOpen(false);
      },
    }),
    [ctx.items, ctx.handlers, ctx.setOpen],
  );

  const dropdownProps: DropdownProps = {
    menu: menuProps,
    trigger: ["click"],
    placement: ctx.placement,
    open: ctx.open,
    onOpenChange: flag => ctx.setOpen(flag),
    overlayClassName: ctx.overlayClassName,
    disabled,
  };

  const triggerNode: ReactElement = asChild && children ? (children as ReactElement) : (
    <span className="inline-flex" role="button">{children}</span>
  );

  return <Dropdown {...dropdownProps}>{triggerNode}</Dropdown>;
}

type DropdownMenuContentProps = PropsWithChildren<{
  className?: string;
  align?: "start" | "center" | "end";
}>;

export function DropdownMenuContent({ className, align = "start", children }: DropdownMenuContentProps) {
  const ctx = useDropdownMenuContext("DropdownMenuContent");

  useEffect(() => {
    ctx.setOverlayClassName(className);
    return () => ctx.setOverlayClassName(undefined);
  }, [ctx, className]);

  useEffect(() => {
    ctx.setPlacement(mapAlignToPlacement(align));
  }, [ctx, align]);

  return <>{children}</>;
}

function mapAlignToPlacement(align: "start" | "center" | "end"): DropdownProps["placement"] {
  switch (align) {
    case "end":
      return "bottomRight";
    case "center":
      return "bottom";
    case "start":
    default:
      return "bottomLeft";
  }
}

type DropdownMenuItemProps = PropsWithChildren<{
  className?: string;
  inset?: boolean;
  variant?: "default" | "destructive";
  disabled?: boolean;
  onClick?: (event: ReactMouseEvent | MouseEvent) => void;
}>;

export function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  disabled,
  onClick,
  children,
}: DropdownMenuItemProps) {
  const ctx = useDropdownMenuContext("DropdownMenuItem");
  const id = useId();
  const label = useMemo(
    () => (
      <div className={cn("flex items-center gap-2", inset && "pl-6", className)}>{children}</div>
    ),
    [children, className, inset],
  );

  useEffect(() => {
    const key = id;

    const item: MenuItemType = {
      key,
      label,
      disabled,
      danger: variant === "destructive",
    };

    const handler = onClick
      ? (event: MouseEvent) => {
          onClick(event as unknown as ReactMouseEvent);
        }
      : undefined;

    ctx.registerItem(item, handler);

    return () => ctx.unregisterItem(key);
  }, [ctx, id, label, variant, disabled, onClick]);

  return null;
}

type DropdownMenuSeparatorProps = {
  className?: string;
};

export function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps = {}) {
  const ctx = useDropdownMenuContext("DropdownMenuSeparator");
  const id = useId();

  useEffect(() => {
    const item: MenuItemType = {
      key: id,
      type: "divider",
      className,
    } as MenuItemType;

    ctx.registerItem(item);
    return () => ctx.unregisterItem(id);
  }, [ctx, id, className]);

  return null;
}

export function DropdownMenuGroup({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>;
}

export function DropdownMenuLabel({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>;
}

export function DropdownMenuShortcut({ children }: PropsWithChildren<unknown>) {
  return <span className="ml-auto text-xs opacity-60">{children}</span>;
}

export function DropdownMenuCheckboxItem() {
  return null;
}

export function DropdownMenuRadioGroup({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>;
}

export function DropdownMenuRadioItem({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>;
}

export function DropdownMenuPortal({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>;
}

export function DropdownMenuSub({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>;
}

export function DropdownMenuSubTrigger({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>;
}

export function DropdownMenuSubContent({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>;
}
