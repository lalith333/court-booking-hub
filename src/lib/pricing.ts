import { Court, PricingRule, Equipment, Coach, PriceBreakdown, AppliedRule } from '@/types/booking';

export function calculatePrice(
  court: Court,
  date: Date,
  startTime: string,
  endTime: string,
  pricingRules: PricingRule[],
  selectedEquipment: { equipment: Equipment; quantity: number }[],
  selectedCoach: Coach | null
): PriceBreakdown {
  // Calculate duration in hours
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const durationHours = (endHour + endMin / 60) - (startHour + startMin / 60);

  // Base court price
  const baseCourPrice = court.base_hourly_rate * durationHours;

  // Sort rules by priority (higher priority = applied later)
  const sortedRules = [...pricingRules]
    .filter(rule => rule.is_active)
    .sort((a, b) => a.priority - b.priority);

  // Apply pricing rules
  let currentPrice = baseCourPrice;
  const appliedRules: AppliedRule[] = [];

  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const bookingHour = startHour;

  for (const rule of sortedRules) {
    let applies = false;

    switch (rule.rule_type) {
      case 'base':
        // Base rule always applies (as the starting point)
        applies = false; // Already included in base price
        break;

      case 'court_type':
        applies = rule.applies_to_court_type === court.court_type;
        break;

      case 'peak_hours':
        if (rule.start_hour !== null && rule.end_hour !== null) {
          applies = bookingHour >= rule.start_hour && bookingHour < rule.end_hour;
        }
        break;

      case 'weekend':
        applies = isWeekend;
        break;
    }

    if (applies) {
      const effect = currentPrice * (rule.multiplier - 1) + rule.flat_fee;
      currentPrice = currentPrice * rule.multiplier + rule.flat_fee;
      
      appliedRules.push({
        name: rule.name,
        type: rule.rule_type,
        multiplier: rule.multiplier,
        flat_fee: rule.flat_fee,
        effect: effect,
      });
    }
  }

  // Calculate equipment total
  const equipmentTotal = selectedEquipment.reduce((total, item) => {
    return total + (item.equipment.hourly_rate * item.quantity * durationHours);
  }, 0);

  // Calculate coach fee
  const coachFee = selectedCoach ? selectedCoach.hourly_rate * durationHours : 0;

  // Calculate final total
  const subtotal = currentPrice;
  const total = currentPrice + equipmentTotal + coachFee;

  return {
    base_court_price: baseCourPrice,
    applied_rules: appliedRules,
    equipment_total: equipmentTotal,
    coach_fee: coachFee,
    subtotal,
    total,
  };
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function generateTimeSlots(startHour = 6, endHour = 22): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
}
