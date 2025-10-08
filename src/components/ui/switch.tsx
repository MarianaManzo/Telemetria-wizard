import { Switch as AntdSwitch } from "antd";
import type { SwitchProps as AntdSwitchProps, SwitchRef } from "antd";
import type { SwitchChangeEventHandler } from "antd/es/switch";
import { forwardRef } from "react";
import { cn } from "./utils";

type SwitchProps = Omit<AntdSwitchProps, "onChange"> & {
  onChange?: SwitchChangeEventHandler;
  onCheckedChange?: (checked: boolean) => void;
};

export const Switch = forwardRef<SwitchRef, SwitchProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange: SwitchChangeEventHandler = (checked, event) => {
      onCheckedChange?.(checked);
      onChange?.(checked, event);
    };

    return (
      <AntdSwitch
        ref={ref}
        className={cn(className)}
        onChange={handleChange}
        {...props}
      />
    );
  },
);

Switch.displayName = "Switch";
