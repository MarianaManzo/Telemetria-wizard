import { Select as AntdSelect } from "antd";
import type { SelectProps as AntdSelectProps, SelectRef } from "antd";
import {
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "./utils";

type Option = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type SelectContextValue = {
  value?: string;
  setValue: (value: string) => void;
  registerOption: (option: Option) => void;
  unregisterOption: (value: string) => void;
  options: Option[];
  placeholder?: ReactNode;
  setPlaceholder: (placeholder?: ReactNode) => void;
  disabled?: boolean;
  dropdownClassName?: string;
  setDropdownClassName: (className?: string) => void;
};

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext(component: string) {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error(`${component} must be used within a Select`);
  }
  return ctx;
}

type BaseSelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: ReactNode;
};

export function Select({ value, defaultValue, onValueChange, disabled, children }: BaseSelectProps) {
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const [options, setOptions] = useState<Option[]>([]);
  const [placeholder, setPlaceholder] = useState<ReactNode | undefined>();
  const [dropdownClassName, setDropdownClassName] = useState<string | undefined>();

  const handleChange = useCallback(
    (next: string) => {
      onValueChange?.(next);
      if (value === undefined) {
        setInternalValue(next);
      }
    },
    [onValueChange, value],
  );

  const registerOption = useCallback((option: Option) => {
    setOptions(prev => {
      const existingIndex = prev.findIndex(item => item.value === option.value);
      if (existingIndex === -1) {
        return [...prev, option];
      }
      const next = [...prev];
      next[existingIndex] = option;
      return next;
    });
  }, []);

  const unregisterOption = useCallback((optionValue: string) => {
    setOptions(prev => prev.filter(item => item.value !== optionValue));
  }, []);

  const contextValue = useMemo<SelectContextValue>(
    () => ({
      value: value ?? internalValue,
      setValue: handleChange,
      registerOption,
      unregisterOption,
      options,
      placeholder,
      setPlaceholder,
      disabled,
      dropdownClassName,
      setDropdownClassName,
    }),
    [
      value,
      internalValue,
      handleChange,
      registerOption,
      unregisterOption,
      options,
      placeholder,
      disabled,
      dropdownClassName,
    ],
  );

  return <SelectContext.Provider value={contextValue}>{children}</SelectContext.Provider>;
}

type SelectTriggerSize = "sm" | "default";

type TriggerProps = Omit<AntdSelectProps<string>, "options" | "value" | "onChange" | "size"> & {
  size?: SelectTriggerSize;
  className?: string;
  children?: ReactNode;
  dropdownClassName?: string;
};

export const SelectTrigger = forwardRef<SelectRef, TriggerProps>(
  ({ className, size = "default", dropdownClassName, children, ...props }, ref) => {
    const ctx = useSelectContext("SelectTrigger");

    const antdSize: AntdSelectProps<string>["size"] = size === "sm" ? "small" : "middle";

    const currentValue = ctx.value === '' ? undefined : ctx.value;

    return (
      <AntdSelect
        ref={ref}
        className={cn("text-[14px]", className)}
        size={antdSize}
        value={currentValue}
        onChange={value => ctx.setValue(value)}
        options={ctx.options}
        placeholder={ctx.placeholder}
        disabled={ctx.disabled}
        dropdownClassName={cn(ctx.dropdownClassName, dropdownClassName)}
        {...props}
      />
    );
  },
);

SelectTrigger.displayName = "SelectTrigger";

type SelectValueProps = {
  placeholder?: string;
};

export function SelectValue({ placeholder }: SelectValueProps) {
  const ctx = useSelectContext("SelectValue");

  useEffect(() => {
    if (placeholder) {
      ctx.setPlaceholder(
        <span className="text-[14px] text-gray-400 truncate">
          {placeholder}
        </span>
      );
    } else {
      ctx.setPlaceholder(undefined);
    }
  }, [ctx, placeholder]);

  return null;
}

type SelectContentProps = {
  className?: string;
  children?: ReactNode;
};

export function SelectContent({ className, children }: SelectContentProps) {
  const ctx = useSelectContext("SelectContent");

  useEffect(() => {
    ctx.setDropdownClassName(className);
    return () => ctx.setDropdownClassName(undefined);
  }, [ctx, className]);

  return <>{children}</>;
}

type SelectItemProps = {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

export function SelectItem({ value, children, disabled, className }: SelectItemProps) {
  const ctx = useSelectContext("SelectItem");

  useEffect(() => {
    ctx.registerOption({ value, label: <span className={cn(className)}>{children}</span>, disabled });
    return () => ctx.unregisterOption(value);
  }, [ctx, value, children, disabled, className]);

  return null;
}

export function SelectGroup({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function SelectLabel({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function SelectSeparator() {
  return null;
}

export function SelectScrollUpButton() {
  return null;
}

export function SelectScrollDownButton() {
  return null;
}
