import { Coach, CoachAvailability, DayOfWeek } from '@/types/booking';
import { formatPrice } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { User, Clock, CheckCircle } from 'lucide-react';

interface CoachSelectorProps {
  coaches: Coach[];
  availability: CoachAvailability[];
  selectedDate: Date | null;
  selectedStart: string | null;
  selectedEnd: string | null;
  selectedCoach: Coach | null;
  onSelectCoach: (coach: Coach | null) => void;
}

export function CoachSelector({
  coaches,
  availability,
  selectedDate,
  selectedStart,
  selectedEnd,
  selectedCoach,
  onSelectCoach,
}: CoachSelectorProps) {
  const getDayOfWeek = (date: Date): DayOfWeek => {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  const isCoachAvailable = (coach: Coach) => {
    if (!selectedDate || !selectedStart || !selectedEnd) return false;

    const dayOfWeek = getDayOfWeek(selectedDate);
    const coachSlots = availability.filter(a => a.coach_id === coach.id && a.day_of_week === dayOfWeek);

    if (coachSlots.length === 0) return false;

    const [bookingStart] = selectedStart.split(':').map(Number);
    const [bookingEnd] = selectedEnd.split(':').map(Number);

    return coachSlots.some(slot => {
      const [slotStart] = slot.start_time.split(':').map(Number);
      const [slotEnd] = slot.end_time.split(':').map(Number);
      return bookingStart >= slotStart && bookingEnd <= slotEnd;
    });
  };

  const getCoachAvailabilityText = (coach: Coach) => {
    const coachSlots = availability.filter(a => a.coach_id === coach.id);
    const days = [...new Set(coachSlots.map(s => s.day_of_week))];
    return days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
  };

  return (
    <div className="space-y-3">
      {/* No coach option */}
      <button
        onClick={() => onSelectCoach(null)}
        className={cn(
          "w-full p-4 rounded-xl border-2 text-left transition-all duration-300",
          "hover:scale-[1.01] active:scale-[0.99]",
          selectedCoach === null
            ? "border-primary bg-primary/10"
            : "border-border bg-card hover:border-primary/30"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-foreground">No Coach</h4>
            <p className="text-sm text-muted-foreground">Play on your own</p>
          </div>
          {selectedCoach === null && (
            <CheckCircle className="w-5 h-5 text-primary" />
          )}
        </div>
      </button>

      {coaches.map((coach) => {
        const available = isCoachAvailable(coach);
        const isSelected = selectedCoach?.id === coach.id;

        return (
          <button
            key={coach.id}
            onClick={() => available && onSelectCoach(coach)}
            disabled={!available}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all duration-300",
              "hover:scale-[1.01] active:scale-[0.99]",
              !available && "opacity-50 cursor-not-allowed",
              isSelected
                ? "border-primary bg-primary/10"
                : available
                  ? "border-border bg-card hover:border-primary/30"
                  : "border-border bg-card"
            )}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-foreground">{coach.name}</h4>
                  <span className="font-bold text-primary">{formatPrice(coach.hourly_rate)}/hr</span>
                </div>
                {coach.bio && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{coach.bio}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{getCoachAvailabilityText(coach)}</span>
                </div>
                {!available && selectedDate && (
                  <p className="text-xs text-accent mt-2">Not available for selected time</p>
                )}
              </div>
              {isSelected && (
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
