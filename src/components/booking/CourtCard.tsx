import { Court } from '@/types/booking';
import { formatPrice } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { MapPin, Home } from 'lucide-react';

interface CourtCardProps {
  court: Court;
  selected: boolean;
  onSelect: (court: Court) => void;
}

export function CourtCard({ court, selected, onSelect }: CourtCardProps) {
  const isIndoor = court.court_type === 'indoor';

  return (
    <button
      onClick={() => onSelect(court)}
      className={cn(
        "relative w-full p-4 rounded-xl border-2 text-left transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",
        selected
          ? "border-primary bg-primary/10 shadow-lg"
          : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
      )}
    >
      {/* Court type badge */}
      <div className={cn(
        "absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
        isIndoor
          ? "bg-primary/20 text-primary"
          : "bg-success/20 text-success"
      )}>
        {isIndoor ? <Home className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
        {isIndoor ? 'Indoor' : 'Outdoor'}
      </div>

      <h3 className="font-semibold text-lg text-foreground mb-1">{court.name}</h3>
      <p className="text-muted-foreground text-sm mb-3">
        {isIndoor ? 'Climate controlled, premium surface' : 'Natural light, fresh air'}
      </p>
      
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-primary">{formatPrice(court.base_hourly_rate)}</span>
        <span className="text-muted-foreground text-sm">/hour</span>
      </div>

      {/* Selection indicator */}
      {selected && (
        <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
