import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Trophy, Zap } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        
        <nav className="relative z-10 container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-xl">🏸</span>
            </div>
            <span className="font-bold text-xl text-foreground">CourtBook</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>Sign In</Button>
            <Button variant="hero" onClick={() => navigate('/book')}>Book Now</Button>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-slide-up">
            Book Your <span className="text-gradient">Perfect Court</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Premium badminton courts, professional equipment, and expert coaches. 
            All in one seamless booking experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button variant="hero" size="xl" onClick={() => navigate('/book')}>
              <Calendar className="w-5 h-5 mr-2" />
              Start Booking
            </Button>
            <Button variant="outline" size="xl" onClick={() => navigate('/auth')}>
              View My Bookings
            </Button>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Trophy, title: '4 Premium Courts', desc: '2 indoor & 2 outdoor courts with professional surfaces' },
            { icon: Zap, title: 'Equipment Rental', desc: 'Pro rackets, court shoes, and shuttlecocks available' },
            { icon: Users, title: 'Expert Coaches', desc: '3 certified coaches with flexible availability' },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Info */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Dynamic Pricing</h2>
          <p className="text-muted-foreground">Rates adjust based on demand and court type</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Indoor Courts', price: '$60/hr', tag: 'Premium' },
            { label: 'Outdoor Courts', price: '$45/hr', tag: 'Standard' },
            { label: 'Peak Hours (6-9 PM)', price: '+30%', tag: 'Surge' },
            { label: 'Weekends', price: '+25%', tag: 'Weekend' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/20 text-primary">{item.tag}</span>
              <p className="text-muted-foreground mt-3 text-sm">{item.label}</p>
              <p className="text-2xl font-bold text-foreground">{item.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 p-12 text-center border border-primary/30">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Play?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Book your court in under a minute. Select your time, add equipment and coaching if needed.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate('/book')}>
            Book a Court Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          © 2024 CourtBook. Premium Badminton Court Booking Platform.
        </div>
      </footer>
    </div>
  );
};

export default Index;
