import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { CourtCard } from '@/components/booking/CourtCard';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { EquipmentSelector } from '@/components/booking/EquipmentSelector';
import { CoachSelector } from '@/components/booking/CoachSelector';
import { PriceBreakdown } from '@/components/booking/PriceBreakdown';
import { useCourts, useEquipment, useCoaches, useCoachAvailability, usePricingRules, useCourtBookings } from '@/hooks/useBookingData';
import { useAuth } from '@/hooks/useAuth';
import { calculatePrice } from '@/lib/pricing';
import { Court, Equipment, Coach, BookingSelection, PriceBreakdown as PriceBreakdownType } from '@/types/booking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function Book() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selection, setSelection] = useState<BookingSelection>({
    date: null,
    court: null,
    startTime: null,
    endTime: null,
    equipment: [],
    coach: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: courts = [], isLoading: courtsLoading } = useCourts();
  const { data: equipment = [], isLoading: equipmentLoading } = useEquipment();
  const { data: coaches = [], isLoading: coachesLoading } = useCoaches();
  const { data: coachAvailability = [] } = useCoachAvailability();
  const { data: pricingRules = [] } = usePricingRules();
  
  const dateStr = selection.date ? format(selection.date, 'yyyy-MM-dd') : '';
  const { data: bookedSlots = [] } = useCourtBookings(selection.court?.id || '', dateStr);

  const priceBreakdown = useMemo<PriceBreakdownType | null>(() => {
    if (!selection.court || !selection.date || !selection.startTime || !selection.endTime) {
      return null;
    }
    return calculatePrice(
      selection.court,
      selection.date,
      selection.startTime,
      selection.endTime,
      pricingRules,
      selection.equipment,
      selection.coach
    );
  }, [selection, pricingRules]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to book');
      navigate('/auth');
      return;
    }

    if (!selection.court || !selection.date || !selection.startTime || !selection.endTime || !priceBreakdown) {
      toast.error('Please complete all required selections');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          court_id: selection.court.id,
          coach_id: selection.coach?.id || null,
          booking_date: format(selection.date, 'yyyy-MM-dd'),
          start_time: selection.startTime,
          end_time: selection.endTime,
          base_price: priceBreakdown.base_court_price,
          total_price: priceBreakdown.total,
          price_breakdown: priceBreakdown as unknown as Record<string, unknown>,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      if (selection.equipment.length > 0 && booking) {
        const equipmentInserts = selection.equipment.map(item => ({
          booking_id: booking.id,
          equipment_id: item.equipment.id,
          quantity: item.quantity,
          unit_price: item.equipment.hourly_rate,
        }));

        const { error: equipError } = await supabase
          .from('booking_equipment')
          .insert(equipmentInserts);

        if (equipError) throw equipError;
      }

      toast.success('Booking confirmed!');
      navigate('/bookings');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = courtsLoading || equipmentLoading || coachesLoading;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-xl text-foreground">Book a Court</h1>
          </div>
          {!user && (
            <Button variant="outline" onClick={() => navigate('/auth')}>Sign In</Button>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Date Selection */}
              <section className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-semibold text-lg text-foreground mb-4">1. Select Date</h2>
                <BookingCalendar selectedDate={selection.date} onSelectDate={(date) => setSelection(s => ({ ...s, date, startTime: null, endTime: null }))} />
              </section>

              {/* Court Selection */}
              <section className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-semibold text-lg text-foreground mb-4">2. Choose Court</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {courts.map((court) => (
                    <CourtCard key={court.id} court={court} selected={selection.court?.id === court.id} onSelect={(c) => setSelection(s => ({ ...s, court: c, startTime: null, endTime: null }))} />
                  ))}
                </div>
              </section>

              {/* Time Selection */}
              {selection.court && selection.date && (
                <section className="p-6 rounded-2xl bg-card border border-border animate-fade-in">
                  <h2 className="font-semibold text-lg text-foreground mb-4">3. Select Time</h2>
                  <TimeSlotPicker selectedStart={selection.startTime} selectedEnd={selection.endTime} bookedSlots={bookedSlots} onSelectStart={(t) => setSelection(s => ({ ...s, startTime: t }))} onSelectEnd={(t) => setSelection(s => ({ ...s, endTime: t }))} />
                </section>
              )}

              {/* Equipment */}
              {selection.startTime && selection.endTime && (
                <section className="p-6 rounded-2xl bg-card border border-border animate-fade-in">
                  <h2 className="font-semibold text-lg text-foreground mb-4">4. Add Equipment (Optional)</h2>
                  <EquipmentSelector equipment={equipment} selected={selection.equipment} onSelectionChange={(e) => setSelection(s => ({ ...s, equipment: e }))} />
                </section>
              )}

              {/* Coach */}
              {selection.startTime && selection.endTime && (
                <section className="p-6 rounded-2xl bg-card border border-border animate-fade-in">
                  <h2 className="font-semibold text-lg text-foreground mb-4">5. Add Coach (Optional)</h2>
                  <CoachSelector coaches={coaches} availability={coachAvailability} selectedDate={selection.date} selectedStart={selection.startTime} selectedEnd={selection.endTime} selectedCoach={selection.coach} onSelectCoach={(c) => setSelection(s => ({ ...s, coach: c }))} />
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <PriceBreakdown breakdown={priceBreakdown} />
                <Button variant="hero" size="lg" className="w-full" disabled={!priceBreakdown || isSubmitting} onClick={handleSubmit}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </Button>
                {!user && <p className="text-sm text-muted-foreground text-center">Sign in required to complete booking</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
