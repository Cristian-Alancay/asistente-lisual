import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

type DatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function DatePicker({ value, onChange, placeholder = "Seleccionar fecha" }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const date = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const isValidDate = date && !isNaN(date.getTime());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-left font-normal",
            !isValidDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {isValidDate ? format(date, "d 'de' MMMM, yyyy", { locale: es }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={isValidDate ? date : undefined}
          onSelect={(d) => {
            if (d) {
              onChange(format(d, "yyyy-MM-dd"));
              setOpen(false);
            }
          }}
          locale={es}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
