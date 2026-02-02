-- Create affiliates table
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  paypal_email TEXT,
  affiliate_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  commission_rate DECIMAL(5,2) DEFAULT 30.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create affiliate_clicks table for tracking link clicks
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id),
  affiliate_code TEXT NOT NULL,
  page_url TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create affiliate_conversions table for tracking sales
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id),
  affiliate_code TEXT NOT NULL,
  purchase_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON public.affiliates(email);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON public.affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_code ON public.affiliate_clicks(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created ON public.affiliate_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_code ON public.affiliate_conversions(affiliate_code);

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Allow public operations for affiliate system
CREATE POLICY "Allow public insert on affiliates" ON public.affiliates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on affiliates" ON public.affiliates FOR SELECT USING (true);
CREATE POLICY "Allow public update on affiliates" ON public.affiliates FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on affiliate_clicks" ON public.affiliate_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on affiliate_clicks" ON public.affiliate_clicks FOR SELECT USING (true);

CREATE POLICY "Allow public insert on affiliate_conversions" ON public.affiliate_conversions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on affiliate_conversions" ON public.affiliate_conversions FOR SELECT USING (true);
CREATE POLICY "Allow public update on affiliate_conversions" ON public.affiliate_conversions FOR UPDATE USING (true);
