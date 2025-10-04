import { Calendar as AntdCalendar } from "antd";
import type { CalendarProps as AntdCalendarProps } from "antd";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { cn } from "./utils";

type CalendarMode = "single";

type CalendarProps = {
  className?: string;
  footerRender?: () => ReactNode;
  mode?: CalendarMode;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
} & Omit<AntdCalendarProps, "value" | "onSelect" | "fullscreen">;

export function Calendar({ className, footerRender, mode = "single", selected, onSelect, ...props }: CalendarProps) {
  const value = selected ? dayjs(selected) : undefined;

  return (
    <AntdCalendar
      fullscreen={false}
      value={value}
      onSelect={date => {
        if (mode === "single") {
          onSelect?.(date?.toDate());
        }
      }}
      className={cn(className)}
      fullCellRender={props.fullCellRender}
      disabledDate={props.disabledDate}
      headerRender={props.headerRender}
      footerRender={footerRender}
      mode="month"
      {...props}
    />
  );
}
