export type CourtType = 'indoor' | 'outdoor';
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';
export type EquipmentType = 'racket' | 'shoes' | 'shuttlecock' | 'other';
export type PricingRuleType = 'peak_hours' | 'weekend' | 'court_type' | 'base';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Court {
  id: string;
  name: string;
  court_type: CourtType;
  base_hourly_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  equipment_type: EquipmentType;
  total_quantity: number;
  hourly_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coach {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  hourly_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachAvailability {
  id: string;
  coach_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
}

export interface PricingRule {
  id: string;
  name: string;
  rule_type: PricingRuleType;
  multiplier: number;
  flat_fee: number;
  start_hour: number | null;
  end_hour: number | null;
  applies_to_court_type: CourtType | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  court_id: string;
  coach_id: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  base_price: number;
  total_price: number;
  price_breakdown: PriceBreakdown;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  court?: Court;
  coach?: Coach;
  booking_equipment?: BookingEquipment[];
}

export interface BookingEquipment {
  id: string;
  booking_id: string;
  equipment_id: string;
  quantity: number;
  unit_price: number;
  equipment?: Equipment;
}

export interface PriceBreakdown {
  base_court_price: number;
  applied_rules: AppliedRule[];
  equipment_total: number;
  coach_fee: number;
  subtotal: number;
  total: number;
}

export interface AppliedRule {
  name: string;
  type: PricingRuleType;
  multiplier: number;
  flat_fee: number;
  effect: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  court_id?: string;
}

export interface BookingSelection {
  date: Date | null;
  court: Court | null;
  startTime: string | null;
  endTime: string | null;
  equipment: { equipment: Equipment; quantity: number }[];
  coach: Coach | null;
}
