import { Switch as AntdSwitch } from "antd";
import type { SwitchProps as AntdSwitchProps } from "antd";
import type { SwitchRef } from "antd";
import { forwardRef } from "react";
import { cn } from "./utils";

type SwitchProps = AntdSwitchProps;

export const Switch = forwardRef<SwitchRef, SwitchProps>(({ className, ...props }, ref) => {
  return <AntdSwitch ref={ref} className={cn(className)} {...props} />;
});

Switch.displayName = "Switch";
