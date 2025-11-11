import { Input as AntdInput } from "antd";
import type { InputProps as AntdInputProps } from "antd";
import type { InputRef } from "antd";
import { forwardRef } from "react";
import { cn } from "./utils";

type InputProps = AntdInputProps;

const sanitizeNumericValue = (value: string) => value.replace(/[^0-9.\-+]/g, '');

export const Input = forwardRef<InputRef, InputProps>(({ className, onChange, type, ...props }, ref) => {
  const handleChange: AntdInputProps['onChange'] = (event) => {
    if (type === 'number') {
      const sanitized = sanitizeNumericValue(event.target.value);
      if (sanitized !== event.target.value) {
        event.target.value = sanitized;
      }
    }
    onChange?.(event);
  };

  return <AntdInput ref={ref} className={cn(className)} type={type} onChange={handleChange} {...props} />;
});

Input.displayName = "Input";
