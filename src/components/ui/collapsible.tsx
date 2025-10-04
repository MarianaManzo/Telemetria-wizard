import { Collapse } from "antd";
import type { CollapseProps } from "antd";
import {
  createContext,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "./utils";

type CollapsibleContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  setTrigger: (trigger: TriggerState | undefined) => void;
  setContent: (content: ContentState | undefined) => void;
};

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext(component: string) {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Collapsible>`);
  }
  return ctx;
}

type TriggerState = {
  node: ReactNode;
  className?: string;
};

type ContentState = {
  node: ReactNode;
  className?: string;
};

type CollapsibleRootProps = PropsWithChildren<{
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapseProps?: CollapseProps;
  className?: string;
}>;

export function Collapsible({
  open,
  defaultOpen,
  onOpenChange,
  collapseProps,
  className,
  children,
}: CollapsibleRootProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const [trigger, setTrigger] = useState<TriggerState | undefined>();
  const [content, setContent] = useState<ContentState | undefined>();

  const isControlled = open !== undefined;
  const actualOpen = isControlled ? open : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const contextValue = useMemo<CollapsibleContextValue>(
    () => ({ open: actualOpen ?? false, setOpen, setTrigger, setContent }),
    [actualOpen, setOpen],
  );

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <Collapse
        activeKey={actualOpen ? ["panel"] : []}
        onChange={keys => {
          const next = Array.isArray(keys) ? keys.includes("panel") : Boolean(keys);
          setOpen(next);
        }}
        collapsible="icon"
        expandIconPosition="end"
        showArrow={false}
        className={cn(className)}
        {...collapseProps}
      >
        <Collapse.Panel
          key="panel"
          header={
            trigger ? (
              <div className={cn(trigger.className)} data-state={actualOpen ? "open" : "closed"}>
                {trigger.node}
              </div>
            ) : null
          }
        >
          <div className={cn(content?.className)} data-state={actualOpen ? "open" : "closed"}>
            {content?.node}
          </div>
        </Collapse.Panel>
      </Collapse>
      <div style={{ display: "none" }} aria-hidden>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

type CollapsibleTriggerProps = PropsWithChildren<{
  className?: string;
  asChild?: boolean;
}>;

export function CollapsibleTrigger({ className, children }: CollapsibleTriggerProps) {
  const ctx = useCollapsibleContext("CollapsibleTrigger");

  useEffect(() => {
    ctx.setTrigger({ node: children, className });
    return () => ctx.setTrigger(undefined);
  }, [ctx, children, className]);

  return null;
}

type CollapsibleContentProps = PropsWithChildren<{
  className?: string;
}>;

export function CollapsibleContent({ className, children }: CollapsibleContentProps) {
  const ctx = useCollapsibleContext("CollapsibleContent");

  useEffect(() => {
    ctx.setContent({ node: children, className });
    return () => ctx.setContent(undefined);
  }, [ctx, children, className]);

  return null;
}
