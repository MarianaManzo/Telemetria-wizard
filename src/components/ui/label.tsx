import { Typography } from "antd";
import type { LabelHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "./utils";

const { Text } = Typography;

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  textClassName?: string;
};

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, textClassName, children, ...props }, ref) => {
    return (
      <label ref={ref} className={cn(className)} {...props}>
        <Text className={cn(textClassName)}>{children}</Text>
      </label>
    );
  },
);

Label.displayName = "Label";
