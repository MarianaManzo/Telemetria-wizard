import { Checkbox as AntdCheckbox } from "antd";
import type { CheckboxProps as AntdCheckboxProps } from "antd";
import type { CheckboxRef } from "antd";
import { forwardRef } from "react";
import { cn } from "./utils";

type CheckboxProps = AntdCheckboxProps;

export const Checkbox = forwardRef<CheckboxRef, CheckboxProps>(({ className, ...props }, ref) => {
  return <AntdCheckbox ref={ref} className={cn(className)} {...props} />;
});

Checkbox.displayName = "Checkbox";
