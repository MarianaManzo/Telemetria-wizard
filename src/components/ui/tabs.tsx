import { Button } from "antd";
import type { ButtonProps } from "antd";
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

type TabsContextValue = {
  value?: string;
  setValue: (value: string) => void;
  registerValue: (value: string) => void;
  unregisterValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Tabs>`);
  }
  return ctx;
}

type TabsProps = PropsWithChildren<{
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}>;

export function Tabs({ value, defaultValue, onValueChange, className, children }: TabsProps) {
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const [registeredValues, setRegisteredValues] = useState<string[]>([]);

  const isControlled = value !== undefined;
  const currentValue = value ?? internalValue ?? registeredValues[0];

  useEffect(() => {
    if (!isControlled && internalValue === undefined && registeredValues.length > 0) {
      setInternalValue(registeredValues[0]);
    }
  }, [isControlled, internalValue, registeredValues]);

  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const registerValue = useCallback((next: string) => {
    setRegisteredValues(prev => (prev.includes(next) ? prev : [...prev, next]));
  }, []);

  const unregisterValue = useCallback((target: string) => {
    setRegisteredValues(prev => prev.filter(item => item !== target));
  }, []);

  const contextValue = useMemo<TabsContextValue>(
    () => ({ value: currentValue, setValue, registerValue, unregisterValue }),
    [currentValue, setValue, registerValue, unregisterValue],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("flex flex-col gap-2", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

type TabsListProps = PropsWithChildren<{ className?: string }>;

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div role="tablist" className={cn("inline-flex flex-wrap gap-2", className)}>
      {children}
    </div>
  );
}

type TabsTriggerProps = PropsWithChildren<{
  value: string;
  className?: string;
} & Omit<ButtonProps, "type" | "children" | "className">>;

export function TabsTrigger({ value, className, children, disabled, ...buttonProps }: TabsTriggerProps) {
  const ctx = useTabsContext("TabsTrigger");

  useEffect(() => {
    ctx.registerValue(value);
    return () => ctx.unregisterValue(value);
  }, [ctx, value]);

  const isActive = ctx.value === value;

  const handleClick = useCallback(() => {
    if (!disabled) {
      ctx.setValue(value);
    }
  }, [ctx, value, disabled]);

  return (
    <Button
      {...buttonProps}
      type="text"
      disabled={disabled}
      onClick={handleClick}
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      className={cn("px-4 py-2", className)}
    >
      {children}
    </Button>
  );
}

type TabsContentProps = PropsWithChildren<{ value: string; className?: string; forceMount?: boolean }>;

export function TabsContent({ value, className, forceMount, children }: TabsContentProps) {
  const ctx = useTabsContext("TabsContent");
  const isActive = ctx.value === value;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      aria-hidden={!isActive}
      data-state={isActive ? "active" : "inactive"}
      hidden={!isActive}
      className={cn("flex-1 outline-none", className)}
    >
      {children}
    </div>
  );
}
