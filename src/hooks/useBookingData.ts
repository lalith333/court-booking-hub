import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Court, Equipment, Coach, CoachAvailability, PricingRule, Booking, DayOfWeek } from '@/types/booking';

export function useCourts() {
  return useQuery({
    queryKey: ['courts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Court[];
    },
  });
}

export function useEquipment() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Equipment[];
    },
  });
}

export function useCoaches() {
  return useQuery({
    queryKey: ['coaches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Coach[];
    },
  });
}

export function useCoachAvailability(coachId?: string) {
  return useQuery({
    queryKey: ['coach_availability', coachId],
    queryFn: async () => {
      let query = supabase.from('coach_availability').select('*');
      
      if (coachId) {
        query = query.eq('coach_id', coachId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as CoachAvailability[];
    },
    enabled: true,
  });
}

export function usePricingRules() {
  return useQuery({
    queryKey: ['pricing_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('is_active', true)
        .order('priority');
      
      if (error) throw error;
      return data as PricingRule[];
    },
  });
}

export function useBookings(userId?: string) {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          court:courts(*),
          coach:coaches(*),
          booking_equipment(*, equipment:equipment(*))
        `)
        .eq('user_id', userId)
        .order('booking_date', { ascending: false });
      
      if (error) throw error;
      // Cast with unknown to handle JSON type from Supabase
      return data as unknown as Booking[];
    },
    enabled: !!userId,
  });
}

export function useCourtBookings(courtId: string, date: string) {
  return useQuery({
    queryKey: ['court_bookings', courtId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('court_id', courtId)
        .eq('booking_date', date)
        .neq('status', 'cancelled');
      
      if (error) throw error;
      return data;
    },
    enabled: !!courtId && !!date,
  });
}

export function getDayOfWeekFromDate(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}
