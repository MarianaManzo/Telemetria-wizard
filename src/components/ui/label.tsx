import { Typography } from "antd";
import type { LabelHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "./utils";

const { Text } = Typography;

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label ref={ref} className={cn(className)} {...props}>
        <Text>{children}</Text>
      </label>
    );
  },
);

Label.displayName = "Label";
