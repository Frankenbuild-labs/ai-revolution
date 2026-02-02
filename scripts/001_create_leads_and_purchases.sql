-- Create leads table for users who fill out the opt-in form
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchases table for completed transactions
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  card_last_four TEXT,
  transaction_id TEXT,
  product_type TEXT NOT NULL, -- 'main', 'upsell-amazon', 'upsell-vip'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON public.purchases(email);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON public.purchases(created_at DESC);

-- Enable RLS but allow public read/write for this funnel (no auth required)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Allow all operations without authentication (since this is a public funnel)
CREATE POLICY "Allow public insert on leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on leads" ON public.leads FOR SELECT USING (true);

CREATE POLICY "Allow public insert on purchases" ON public.purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on purchases" ON public.purchases FOR SELECT USING (true);
