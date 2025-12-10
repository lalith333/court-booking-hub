-- Create enum types
CREATE TYPE court_type AS ENUM ('indoor', 'outdoor');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'completed');
CREATE TYPE equipment_type AS ENUM ('racket', 'shoes', 'shuttlecock', 'other');
CREATE TYPE pricing_rule_type AS ENUM ('peak_hours', 'weekend', 'court_type', 'base');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
CREATE TYPE app_role AS ENUM ('admin', 'user');

-- Courts table
CREATE TABLE public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  court_type court_type NOT NULL DEFAULT 'indoor',
  base_hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Equipment table
CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  equipment_type equipment_type NOT NULL,
  total_quantity INTEGER NOT NULL DEFAULT 1,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coaches table
CREATE TABLE public.coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 30.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coach availability
CREATE TABLE public.coach_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  UNIQUE(coach_id, day_of_week, start_time)
);

-- Pricing rules table
CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rule_type pricing_rule_type NOT NULL,
  multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  flat_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  start_hour INTEGER,
  end_hour INTEGER,
  applies_to_court_type court_type,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE RESTRICT,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  price_breakdown JSONB NOT NULL DEFAULT '{}',
  status booking_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(court_id, booking_date, start_time)
);

-- Booking equipment junction table
CREATE TABLE public.booking_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  UNIQUE(booking_id, equipment_id)
);

-- Waitlist table
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ,
  UNIQUE(user_id, court_id, booking_date, start_time)
);

-- Enable RLS on all tables
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Courts: Everyone can view active courts
CREATE POLICY "Anyone can view active courts" ON public.courts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courts" ON public.courts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Equipment: Everyone can view active equipment
CREATE POLICY "Anyone can view active equipment" ON public.equipment
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage equipment" ON public.equipment
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Coaches: Everyone can view active coaches
CREATE POLICY "Anyone can view active coaches" ON public.coaches
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage coaches" ON public.coaches
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Coach availability: Everyone can view
CREATE POLICY "Anyone can view coach availability" ON public.coach_availability
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage coach availability" ON public.coach_availability
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Pricing rules: Everyone can view active rules
CREATE POLICY "Anyone can view active pricing rules" ON public.pricing_rules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage pricing rules" ON public.pricing_rules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles: Only admins can view/manage
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Bookings: Users can view and create their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Booking equipment
CREATE POLICY "Users can view own booking equipment" ON public.booking_equipment
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage own booking equipment" ON public.booking_equipment
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all booking equipment" ON public.booking_equipment
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Waitlist
CREATE POLICY "Users can view own waitlist" ON public.waitlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own waitlist" ON public.waitlist
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all waitlist" ON public.waitlist
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON public.courts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON public.coaches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();