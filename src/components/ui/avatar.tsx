import { Avatar as AntdAvatar } from "antd";
import type { AvatarProps as AntdAvatarProps } from "antd";
import {
  createContext,
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "./utils";

type AvatarContextValue = {
  registerImage: (props: AvatarImageProps | undefined) => void;
  registerFallback: (node: ReactNode) => void;
};

const AvatarContext = createContext<AvatarContextValue | null>(null);

export type AvatarProps = PropsWithChildren<AntdAvatarProps>;

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(({ className, children, ...props }, ref) => {
  const [imageProps, setImageProps] = useState<AvatarImageProps | undefined>();
  const [fallbackNode, setFallbackNode] = useState<ReactNode>(null);

  const contextValue = useMemo<AvatarContextValue>(
    () => ({
      registerImage: setImageProps,
      registerFallback: setFallbackNode,
    }),
    [],
  );

  return (
    <AvatarContext.Provider value={contextValue}>
      <AntdAvatar
        ref={ref}
        src={imageProps?.src}
        alt={imageProps?.alt}
        className={cn(className, imageProps?.className)}
        {...props}
      >
        {fallbackNode}
      </AntdAvatar>
      {children}
    </AvatarContext.Provider>
  );
});

Avatar.displayName = "Avatar";

export type AvatarImageProps = {
  src?: string;
  alt?: string;
  className?: string;
};

export function AvatarImage(props: AvatarImageProps) {
  const ctx = useContext(AvatarContext);

  useEffect(() => {
    ctx?.registerImage(props);
    return () => ctx?.registerImage(undefined);
  }, [ctx, props]);

  return null;
}

export type AvatarFallbackProps = {
  children?: ReactNode;
};

export function AvatarFallback({ children }: AvatarFallbackProps) {
  const ctx = useContext(AvatarContext);

  useEffect(() => {
    ctx?.registerFallback(children ?? null);
    return () => ctx?.registerFallback(null);
  }, [ctx, children]);

  return null;
}
