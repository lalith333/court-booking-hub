import { useState } from 'react';
import { format, addDays, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function BookingCalendar({ selectedDate, onSelectDate }: BookingCalendarProps) {
  const [startDate, setStartDate] = useState(new Date());
  const daysToShow = 14;

  const days = Array.from({ length: daysToShow }, (_, i) => addDays(startDate, i));

  const handlePrev = () => {
    const newStart = addDays(startDate, -7);
    if (!isBefore(newStart, startOfDay(new Date()))) {
      setStartDate(newStart);
    }
  };

  const handleNext = () => {
    setStartDate(addDays(startDate, 7));
  };

  const isDateSelectable = (date: Date) => {
    return !isBefore(date, startOfDay(new Date()));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          {format(startDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={isBefore(addDays(startDate, -7), startOfDay(new Date()))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((date) => {
          const selectable = isDateSelectable(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const today = isToday(date);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <button
              key={date.toISOString()}
              onClick={() => selectable && onSelectDate(date)}
              disabled={!selectable}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
                "hover:scale-105 active:scale-95",
                !selectable && "opacity-40 cursor-not-allowed",
                selectable && !isSelected && "hover:bg-secondary",
                isSelected && "bg-primary text-primary-foreground shadow-md",
                today && !isSelected && "ring-2 ring-primary/50",
                isWeekend && !isSelected && "bg-accent/10"
              )}
            >
              <span className="text-xs text-muted-foreground font-medium">
                {format(date, 'EEE')}
              </span>
              <span className={cn(
                "text-lg font-semibold",
                isSelected ? "text-primary-foreground" : "text-foreground"
              )}>
                {format(date, 'd')}
              </span>
              {today && (
                <span className={cn(
                  "text-[10px]",
                  isSelected ? "text-primary-foreground/80" : "text-primary"
                )}>
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
