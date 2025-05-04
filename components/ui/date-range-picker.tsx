"use client"
import { useState, useCallback } from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface CalendarDateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: DateRange;
  onChange?: (date: DateRange) => void;
}

export function CalendarDateRangePicker({
  className,
  value,
  onChange,
}: CalendarDateRangePickerProps) {
  const [internalDate, setInternalDate] = useState<DateRange>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  })

  const date = value ?? internalDate
  const handleDateChange = useCallback((newDate: DateRange | undefined) => {
    if (onChange && newDate) {
      onChange(newDate)
    } else if (!onChange && newDate) {
      setInternalDate(newDate)
    }
  }, [onChange])

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }, [])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {formatDate(date.from)} -{" "}
                  {formatDate(date.to)}
                </>
              ) : (
                formatDate(date.from)
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 