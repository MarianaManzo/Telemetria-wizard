import { Input } from "antd";
import type { TextAreaProps, TextAreaRef } from "antd/es/input/TextArea";
import { forwardRef } from "react";
import { cn } from "./utils";

const { TextArea: AntdTextArea } = Input;

export const Textarea = forwardRef<TextAreaRef, TextAreaProps>(({ className, ...props }, ref) => {
  return <AntdTextArea ref={ref} className={cn(className)} {...props} />;
});

Textarea.displayName = "Textarea";
