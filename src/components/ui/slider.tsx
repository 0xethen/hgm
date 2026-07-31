import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "#/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];

  return (
    <SliderPrimitive.Root
      className={cn("group/slider data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            // layout
            "relative grow overflow-hidden select-none transition-all duration-150",

            // visible track size
            "bg-input/50",
            "data-horizontal:h-0.5 data-horizontal:w-full",
            "data-vertical:h-full data-vertical:w-0.5",

            // hover anywhere on slider
            "group-hover/slider:data-horizontal:h-1",
            "group-hover/slider:data-vertical:w-1",

            // thumb hover overrides track hover (disabled)
            // "group-has-[[data-slot=slider-thumb]:hover]/slider:data-horizontal:h-2/3",
            // "group-has-[[data-slot=slider-thumb]:hover]/slider:data-vertical:w-2/3",

            // thumb active
            "group-has-[[data-slot=slider-thumb]:active]/slider:data-horizontal:h-1",
            "group-has-[[data-slot=slider-thumb]:active]/slider:data-vertical:w-1",
          )}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>

        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className={cn(
              "transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to,box-shadow]",
              "block h-4 w-6 shrink-0 border-none bg-primary select-none hover:ring-2 hover:ring-ring/30 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
            )}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
