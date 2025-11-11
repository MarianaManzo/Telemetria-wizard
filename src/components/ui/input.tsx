import { Input as AntdInput } from "antd";
import type { InputProps as AntdInputProps } from "antd";
import type { InputRef } from "antd";
import { forwardRef } from "react";
import { cn } from "./utils";

type InputProps = AntdInputProps;

const sanitizeNumericValue = (value: string) => value.replace(/[^0-9.\-+]/g, '');

export const Input = forwardRef<InputRef, InputProps>(({ className, onChange, onKeyDown, type, ...props }, ref) => {
  const handleChange: AntdInputProps['onChange'] = (event) => {
    if (type === 'number') {
      const sanitized = sanitizeNumericValue(event.target.value);
      if (sanitized !== event.target.value) {
        event.target.value = sanitized;
      }
    }
    onChange?.(event);
  };

  const handleKeyDown: AntdInputProps['onKeyDown'] = (event) => {
    if (type === 'number' && ['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
      return;
    }
    onKeyDown?.(event);
  };

  return (
    <AntdInput
      ref={ref}
      className={cn(className)}
      type={type}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
});

Input.displayName = "Input";
