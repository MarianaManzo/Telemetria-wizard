import { Card, Divider, Empty, Input, Typography } from "antd";
import type { InputProps } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "./utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

const { Text } = Typography;

type CommandProps = {
  className?: string;
  children?: ReactNode;
};

export function Command({ className, children }: CommandProps) {
  return (
    <Card className={cn(className)} bordered bodyStyle={{ padding: 0 }}>
      {children}
    </Card>
  );
}

type CommandDialogProps = ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  children?: ReactNode;
};

export function CommandDialog({ title = "Command Palette", description = "Search for a command to run...", children, ...props }: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

type CommandInputProps = InputProps & {
  onValueChange?: (value: string) => void;
};

export function CommandInput({ className, onValueChange, onChange, prefix, ...props }: CommandInputProps) {
  return (
    <div className="border-b px-3 py-2">
      <Input
        allowClear
        className={cn(className)}
        prefix={prefix ?? <SearchOutlined />}
        onChange={event => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...props}
      />
    </div>
  );
}

type CommandListProps = {
  className?: string;
  children?: ReactNode;
};

export function CommandList({ className, children }: CommandListProps) {
  return <div className={cn("max-h-64 overflow-auto", className)}>{children}</div>;
}

type CommandGroupProps = {
  className?: string;
  heading?: ReactNode;
  children?: ReactNode;
};

export function CommandGroup({ className, heading, children }: CommandGroupProps) {
  return (
    <div className={cn("px-2 py-2", className)}>
      {heading ? <Text className="mb-2 block text-xs font-medium text-muted-foreground">{heading}</Text> : null}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

type CommandItemProps = {
  className?: string;
  children?: ReactNode;
  value?: string;
  onSelect?: (value: string) => void;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
};

export function CommandItem({ className, children, value, onSelect, onClick, disabled }: CommandItemProps) {
  return (
    <div
      role="menuitem"
      data-value={value}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-neutral-100",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onClick={event => {
        if (disabled) {
          return;
        }
        onClick?.(event);
        onSelect?.(value ?? "");
      }}
    >
      {children}
    </div>
  );
}

export function CommandEmpty({ children }: { children?: ReactNode }) {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={children ?? "No se encontraron resultados"} />;
}

export function CommandSeparator({ className }: { className?: string }) {
  return <Divider className={className} style={{ margin: 0 }} />;
}

export function CommandShortcut({ className, children }: { className?: string; children?: ReactNode }) {
  return <Text type="secondary" className={cn("ml-auto text-xs", className)}>{children}</Text>;
}
