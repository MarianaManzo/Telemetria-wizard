import { Button as AntdButton } from "antd";
import type { ButtonProps as AntdButtonProps } from "antd";
import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "./utils";

type Variant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type Size = "default" | "sm" | "lg" | "icon";

type NativeButtonType = NonNullable<ButtonHTMLAttributes<HTMLButtonElement>["type"]>;

type ButtonProps = Omit<AntdButtonProps, "type" | "size"> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  type?: NativeButtonType;
  htmlType?: NativeButtonType;
  antdType?: AntdButtonProps["type"];
};

const sizeMap: Record<Size, AntdButtonProps["size"]> = {
  default: "middle",
  sm: "small",
  lg: "large",
  icon: "middle",
};

const variantConfig: Record<Variant, { type?: AntdButtonProps["type"]; danger?: boolean; ghost?: boolean }> = {
  default: { type: "primary" },
  destructive: { type: "primary", danger: true },
  outline: { type: "default" },
  secondary: { type: "default" },
  ghost: { type: "text" },
  link: { type: "link" },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "default",
      size = "default",
      className,
      type: typeProp,
      htmlType,
      antdType,
      danger,
      ghost,
      shape,
      asChild: _asChild,
      ...rest
    },
    ref,
  ) => {
    const design = variantConfig[variant] ?? variantConfig.default;

    const resolvedHtmlType = htmlType ?? (typeProp === "button" || typeProp === "submit" || typeProp === "reset" ? typeProp : undefined);

    const finalType = antdType ?? design.type;
    const finalDanger = danger ?? design.danger;
    const finalGhost = ghost ?? design.ghost;
    const finalShape = size === "icon" ? "circle" : shape;

    return (
      <AntdButton
        ref={ref}
        type={finalType}
        size={sizeMap[size]}
        danger={finalDanger}
        ghost={finalGhost}
        htmlType={resolvedHtmlType}
        shape={finalShape}
        className={cn(className)}
        {...rest}
      />
    );
  },
);

Button.displayName = "Button";
