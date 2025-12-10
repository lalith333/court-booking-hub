import { PriceBreakdown as PriceBreakdownType } from '@/types/booking';
import { formatPrice } from '@/lib/pricing';
import { cn } from '@/lib/utils';

interface PriceBreakdownProps {
  breakdown: PriceBreakdownType | null;
  className?: string;
}

export function PriceBreakdown({ breakdown, className }: PriceBreakdownProps) {
  if (!breakdown) {
    return (
      <div className={cn("p-6 rounded-xl bg-card border border-border", className)}>
        <h3 className="font-semibold text-lg text-foreground mb-4">Price Breakdown</h3>
        <p className="text-muted-foreground text-sm">Select a court and time to see pricing</p>
      </div>
    );
  }

  return (
    <div className={cn("p-6 rounded-xl bg-card border border-border", className)}>
      <h3 className="font-semibold text-lg text-foreground mb-4">Price Breakdown</h3>
      
      <div className="space-y-3">
        {/* Base court price */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base Court Rate</span>
          <span className="text-foreground">{formatPrice(breakdown.base_court_price)}</span>
        </div>

        {/* Applied pricing rules */}
        {breakdown.applied_rules.map((rule, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <span className={cn(
                "px-1.5 py-0.5 rounded text-xs font-medium",
                rule.type === 'peak_hours' && "bg-accent/20 text-accent",
                rule.type === 'weekend' && "bg-warning/20 text-warning",
                rule.type === 'court_type' && "bg-primary/20 text-primary"
              )}>
                {rule.type === 'peak_hours' && 'Peak'}
                {rule.type === 'weekend' && 'Weekend'}
                {rule.type === 'court_type' && 'Premium'}
              </span>
              {rule.name}
            </span>
            <span className="text-accent font-medium">+{formatPrice(rule.effect)}</span>
          </div>
        ))}

        {/* Equipment */}
        {breakdown.equipment_total > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Equipment Rental</span>
            <span className="text-foreground">{formatPrice(breakdown.equipment_total)}</span>
          </div>
        )}

        {/* Coach fee */}
        {breakdown.coach_fee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Coach Session</span>
            <span className="text-foreground">{formatPrice(breakdown.coach_fee)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border my-4" />

        {/* Total */}
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(breakdown.total)}</span>
        </div>
      </div>
    </div>
  );
}
