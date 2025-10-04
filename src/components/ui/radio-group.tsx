import { Radio as AntdRadio } from "antd";
import type { RadioChangeEvent } from "antd/es/radio";
import type { RadioGroupProps as AntdRadioGroupProps, RadioProps as AntdRadioProps } from "antd";
import type { RadioRef } from "antd";
import { forwardRef } from "react";
import { cn } from "./utils";

type RadioGroupProps = Omit<AntdRadioGroupProps, "onChange"> & {
  onValueChange?: (value: string) => void;
  className?: string;
};

export function RadioGroup({ onValueChange, className, ...props }: RadioGroupProps) {
  const handleChange = (event: RadioChangeEvent) => {
    onValueChange?.(event.target.value);
    props.onChange?.(event);
  };

  return <AntdRadio.Group className={cn(className)} {...props} onChange={handleChange} />;
}

type RadioGroupItemProps = AntdRadioProps & {
  className?: string;
};

export const RadioGroupItem = forwardRef<RadioRef, RadioGroupItemProps>(({ className, ...props }, ref) => {
  return <AntdRadio ref={ref} className={cn(className)} {...props} />;
});

RadioGroupItem.displayName = "RadioGroupItem";
