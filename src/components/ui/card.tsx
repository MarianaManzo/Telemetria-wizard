import { Card as AntdCard } from "antd";
import type { CardProps as AntdCardProps } from "antd";
import { forwardRef, type CSSProperties } from "react";
import { radii, spacing, toPx } from "../../styles/tokens";
import { cn } from "./utils";

type CardProps = AntdCardProps;

type DivProps = React.ComponentProps<"div">;

type HeadingProps = React.ComponentProps<"h4">;

type ParagraphProps = React.ComponentProps<"p">;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, children, style, bodyStyle, headStyle, styles, ...props },
    ref,
  ) => {
    const mergedStyle: CSSProperties = {
      borderRadius: toPx(radii.base),
      ...style,
    };

    const mergedBodyStyle: CSSProperties = {
      padding: toPx(spacing.sm),
      ...bodyStyle,
    };

    const mergedHeadStyle: CSSProperties = {
      padding: toPx(spacing.sm),
      ...headStyle,
    };

    const mergedStyles: CardProps["styles"] = {
      ...styles,
      body: { padding: toPx(spacing.sm), ...(styles?.body ?? {}) },
      header: { padding: toPx(spacing.sm), ...(styles?.header ?? {}) },
    };

    return (
      <AntdCard
        ref={ref}
        data-slot="card"
        className={cn(className)}
        bordered
        style={mergedStyle}
        bodyStyle={mergedBodyStyle}
        headStyle={mergedHeadStyle}
        styles={mergedStyles}
        {...props}
      >
        {children}
      </AntdCard>
    );
  },
);

Card.displayName = "Card";

export function CardHeader({ className, style, ...props }: DivProps) {
  return (
    <div
      data-slot="card-header"
      className={cn("grid auto-rows-min items-start", className)}
      style={{ gap: "var(--size-xs)", marginBottom: "var(--size-xs)", ...style }}
      {...props}
    />
  );
}

export function CardTitle({ className, style, ...props }: HeadingProps) {
  return (
    <h4
      data-slot="card-title"
      className={cn(className)}
      style={{ fontSize: "var(--font-size-lg)", lineHeight: "var(--line-height-base)", ...style }}
      {...props}
    />
  );
}

export function CardDescription({ className, style, ...props }: ParagraphProps) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      style={{ fontSize: "var(--font-size-sm)", lineHeight: "var(--line-height-base)", ...style }}
      {...props}
    />
  );
}

export function CardAction({ className, style, ...props }: DivProps) {
  return (
    <div
      data-slot="card-action"
      className={cn(className)}
      style={{ marginTop: "var(--size-xs)", ...style }}
      {...props}
    />
  );
}

export function CardContent({ className, style, ...props }: DivProps) {
  return (
    <div
      data-slot="card-content"
      className={cn(className)}
      style={style}
      {...props}
    />
  );
}

export function CardFooter({ className, style, ...props }: DivProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(className)}
      style={{ marginTop: "var(--size-sm)", ...style }}
      {...props}
    />
  );
}
