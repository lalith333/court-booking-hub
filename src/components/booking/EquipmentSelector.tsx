import { Equipment } from '@/types/booking';
import { formatPrice } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EquipmentSelectorProps {
  equipment: Equipment[];
  selected: { equipment: Equipment; quantity: number }[];
  onSelectionChange: (selected: { equipment: Equipment; quantity: number }[]) => void;
}

export function EquipmentSelector({ equipment, selected, onSelectionChange }: EquipmentSelectorProps) {
  const getSelectedQuantity = (equipmentId: string) => {
    return selected.find(s => s.equipment.id === equipmentId)?.quantity || 0;
  };

  const updateQuantity = (item: Equipment, delta: number) => {
    const currentQty = getSelectedQuantity(item.id);
    const newQty = Math.max(0, Math.min(item.total_quantity, currentQty + delta));

    if (newQty === 0) {
      onSelectionChange(selected.filter(s => s.equipment.id !== item.id));
    } else {
      const existing = selected.find(s => s.equipment.id === item.id);
      if (existing) {
        onSelectionChange(
          selected.map(s => 
            s.equipment.id === item.id ? { ...s, quantity: newQty } : s
          )
        );
      } else {
        onSelectionChange([...selected, { equipment: item, quantity: newQty }]);
      }
    }
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'racket':
        return '🏸';
      case 'shoes':
        return '👟';
      case 'shuttlecock':
        return '🪶';
      default:
        return '📦';
    }
  };

  return (
    <div className="space-y-3">
      {equipment.map((item) => {
        const qty = getSelectedQuantity(item.id);
        const isSelected = qty > 0;

        return (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300",
              isSelected
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getEquipmentIcon(item.equipment_type)}</span>
              <div>
                <h4 className="font-medium text-foreground">{item.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(item.hourly_rate)}/hr • {item.total_quantity} available
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item, -1)}
                disabled={qty === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className={cn(
                "w-8 text-center font-semibold",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                {qty}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item, 1)}
                disabled={qty >= item.total_quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
