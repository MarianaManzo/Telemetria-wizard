import { Input as AntdInput } from "antd";
import type { InputProps as AntdInputProps } from "antd";
import type { InputRef } from "antd";
import { forwardRef } from "react";
import { cn } from "./utils";

type InputProps = AntdInputProps;

export const Input = forwardRef<InputRef, InputProps>(({ className, ...props }, ref) => {
  return <AntdInput ref={ref} className={cn(className)} {...props} />;
});

Input.displayName = "Input";
