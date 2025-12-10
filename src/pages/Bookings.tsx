import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useBookings } from '@/hooks/useBookingData';
import { formatPrice, formatTime } from '@/lib/pricing';
import { ArrowLeft, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Bookings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: bookings = [], isLoading } = useBookings(user?.id);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign in to view bookings</h1>
          <Button variant="hero" onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-xl text-foreground">My Bookings</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="hero" onClick={() => navigate('/book')}>New Booking</Button>
            <Button variant="outline" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No bookings yet</h2>
            <p className="text-muted-foreground mb-6">Book your first court and start playing!</p>
            <Button variant="hero" onClick={() => navigate('/book')}>Book Now</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <div key={booking.id} className={cn(
                "p-6 rounded-2xl bg-card border border-border",
                booking.status === 'cancelled' && "opacity-60"
              )}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        booking.status === 'confirmed' && "bg-success/20 text-success",
                        booking.status === 'completed' && "bg-primary/20 text-primary",
                        booking.status === 'cancelled' && "bg-destructive/20 text-destructive"
                      )}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <h3 className="font-semibold text-foreground">{booking.court?.name || 'Court'}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(booking.booking_date), 'EEE, MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </span>
                      {booking.court && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {booking.court.court_type === 'indoor' ? 'Indoor' : 'Outdoor'}
                        </span>
                      )}
                    </div>
                    {booking.coach && (
                      <p className="text-sm text-muted-foreground">Coach: {booking.coach.name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{formatPrice(booking.total_price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
