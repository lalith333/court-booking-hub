import { cn } from '@/lib/utils';
import { formatTime, generateTimeSlots } from '@/lib/pricing';

interface TimeSlotPickerProps {
  selectedStart: string | null;
  selectedEnd: string | null;
  bookedSlots: { start_time: string; end_time: string }[];
  onSelectStart: (time: string) => void;
  onSelectEnd: (time: string) => void;
}

export function TimeSlotPicker({
  selectedStart,
  selectedEnd,
  bookedSlots,
  onSelectStart,
  onSelectEnd,
}: TimeSlotPickerProps) {
  const slots = generateTimeSlots(6, 22);

  const isSlotBooked = (slotTime: string) => {
    const [slotHour] = slotTime.split(':').map(Number);
    return bookedSlots.some(booking => {
      const [startHour] = booking.start_time.split(':').map(Number);
      const [endHour] = booking.end_time.split(':').map(Number);
      return slotHour >= startHour && slotHour < endHour;
    });
  };

  const isSlotInRange = (slotTime: string) => {
    if (!selectedStart || !selectedEnd) return false;
    const [slotHour] = slotTime.split(':').map(Number);
    const [startHour] = selectedStart.split(':').map(Number);
    const [endHour] = selectedEnd.split(':').map(Number);
    return slotHour >= startHour && slotHour < endHour;
  };

  const isPeakHour = (slotTime: string) => {
    const [hour] = slotTime.split(':').map(Number);
    return hour >= 18 && hour < 21;
  };

  const handleSlotClick = (slotTime: string) => {
    if (isSlotBooked(slotTime)) return;

    if (!selectedStart) {
      onSelectStart(slotTime);
      // Auto-set end time to 1 hour later
      const [hour] = slotTime.split(':').map(Number);
      const endHour = Math.min(hour + 1, 22);
      onSelectEnd(`${endHour.toString().padStart(2, '0')}:00`);
    } else if (slotTime === selectedStart) {
      onSelectStart('');
      onSelectEnd('');
    } else {
      const [clickHour] = slotTime.split(':').map(Number);
      const [startHour] = selectedStart.split(':').map(Number);
      
      if (clickHour > startHour) {
        // Check if any slots between start and clicked are booked
        const hasBlockedSlot = slots.some(s => {
          const [h] = s.split(':').map(Number);
          return h >= startHour && h < clickHour && isSlotBooked(s);
        });
        
        if (!hasBlockedSlot) {
          onSelectEnd(`${(clickHour + 1).toString().padStart(2, '0')}:00`);
        }
      } else {
        onSelectStart(slotTime);
        const endHour = Math.min(clickHour + 1, 22);
        onSelectEnd(`${endHour.toString().padStart(2, '0')}:00`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary border border-border" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted opacity-50" />
          <span className="text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent/30 border border-accent" />
          <span className="text-muted-foreground">Peak Hours</span>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {slots.map((slot) => {
          const booked = isSlotBooked(slot);
          const inRange = isSlotInRange(slot);
          const isStart = slot === selectedStart;
          const peak = isPeakHour(slot);

          return (
            <button
              key={slot}
              onClick={() => handleSlotClick(slot)}
              disabled={booked}
              className={cn(
                "py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:scale-105 active:scale-95",
                booked && "bg-muted/50 text-muted-foreground/50 cursor-not-allowed",
                !booked && !inRange && !isStart && !peak && "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
                !booked && !inRange && !isStart && peak && "bg-accent/20 border border-accent/50 hover:bg-accent/30 text-foreground",
                (inRange || isStart) && "bg-primary text-primary-foreground shadow-md"
              )}
            >
              {formatTime(slot)}
            </button>
          );
        })}
      </div>

      {selectedStart && selectedEnd && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <p className="text-sm text-foreground">
            Selected: <span className="font-semibold text-primary">{formatTime(selectedStart)}</span> to{' '}
            <span className="font-semibold text-primary">{formatTime(selectedEnd)}</span>
            {' '}({(() => {
              const [sh] = selectedStart.split(':').map(Number);
              const [eh] = selectedEnd.split(':').map(Number);
              return eh - sh;
            })()} hour{(() => {
              const [sh] = selectedStart.split(':').map(Number);
              const [eh] = selectedEnd.split(':').map(Number);
              return (eh - sh) > 1 ? 's' : '';
            })()})
          </p>
        </div>
      )}
    </div>
  );
}
