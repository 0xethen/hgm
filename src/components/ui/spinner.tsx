import { cn } from "#/lib/utils";
import { RiLoaderLine } from "@remixicon/react";

function Spinner(props: React.ComponentProps<typeof RiLoaderLine>) {
  return (
    <RiLoaderLine
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", props.className)}
      {...props}
    />
  );
}

export { Spinner };
