import * as React from "react";
import RPNInput from "react-phone-number-input/react-hook-form";
import flags from "react-phone-number-input/flags";
import type { Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/lib/utils";

import "react-phone-number-input/style.css";

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="tel"
    autoComplete="tel"
    data-slot="input"
    className={cn(
      "placeholder:text-muted-foreground h-9 w-full min-w-0 bg-transparent px-3 py-1 text-base outline-none disabled:pointer-events-none disabled:opacity-50 md:text-sm",
      className
    )}
    {...props}
  />
));
InputComponent.displayName = "PhoneInputField";

type PhoneInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  defaultCountry?: string;
  placeholder?: string;
  className?: string;
};

export function PhoneInput<T extends FieldValues>({
  name,
  control,
  defaultCountry = "AR",
  placeholder = "+54 11 1234-5678",
  className,
}: PhoneInputProps<T>) {
  return (
    <RPNInput
      name={name}
      control={control}
      defaultCountry={defaultCountry as never}
      international
      countryCallingCodeEditable={false}
      flags={flags}
      placeholder={placeholder}
      inputComponent={InputComponent}
      className={cn(
        "phone-input-wrapper flex items-center rounded-md border border-input shadow-xs transition-[color,box-shadow]",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        "dark:bg-input/30",
        className
      )}
    />
  );
}
