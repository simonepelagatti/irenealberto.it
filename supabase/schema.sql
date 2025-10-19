-- ============================================
-- IRENE & ALBERTO WEDDING GIFT REGISTRY
-- Supabase Database Schema
-- ============================================

-- 1. EXPERIENCES TABLE
-- Stores all travel experiences/destinations that can be gifted
CREATE TABLE IF NOT EXISTS experiences (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  total_packages INTEGER NOT NULL CHECK (total_packages > 0),
  packages_sold INTEGER DEFAULT 0 CHECK (packages_sold >= 0),
  unit_price DECIMAL(10,2),
  total_value DECIMAL(10,2),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint: Cannot oversell packages
  CONSTRAINT check_not_oversold CHECK (packages_sold <= total_packages)
);

-- 2. ORDERS TABLE
-- Stores guest purchases with unique session codes
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT UNIQUE NOT NULL,
  guest_name TEXT NOT NULL,
  guest_message TEXT,
  total_packages INTEGER NOT NULL DEFAULT 0,
  payment_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ORDER_ITEMS TABLE
-- Junction table linking orders to specific experiences
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  experience_id TEXT NOT NULL REFERENCES experiences(id) ON DELETE RESTRICT,
  packages_count INTEGER DEFAULT 1 CHECK (packages_count > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one experience per order (guests can't add same twice)
  UNIQUE(order_id, experience_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_experiences_active ON experiences(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_experiences_availability ON experiences(packages_sold, total_packages) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_session_code ON orders(session_code);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_experience_id ON order_items(experience_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at for experiences
CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at for orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- EXPERIENCES: Public read access (anyone can view available experiences)
CREATE POLICY "Public read access for active experiences"
  ON experiences
  FOR SELECT
  USING (is_active = true);

-- EXPERIENCES: Service role only for insert/update/delete
CREATE POLICY "Service role full access to experiences"
  ON experiences
  FOR ALL
  USING (auth.role() = 'service_role');

-- ORDERS: Anyone can create orders (checkout flow)
CREATE POLICY "Public can create orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);

-- ORDERS: Users can read their own orders by session code (optional feature)
CREATE POLICY "Public can read any order"
  ON orders
  FOR SELECT
  USING (true);

-- ORDERS: No public updates (only admin can mark payment_confirmed)
CREATE POLICY "Service role can update orders"
  ON orders
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- ORDER_ITEMS: Anyone can create order items during checkout
CREATE POLICY "Public can create order items"
  ON order_items
  FOR INSERT
  WITH CHECK (true);

-- ORDER_ITEMS: Public read access
CREATE POLICY "Public can read order items"
  ON order_items
  FOR SELECT
  USING (true);

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View: Available experiences with remaining packages
CREATE OR REPLACE VIEW available_experiences AS
SELECT
  id,
  title,
  description,
  image_url,
  total_packages,
  packages_sold,
  (total_packages - packages_sold) AS packages_remaining,
  unit_price,
  total_value,
  display_order,
  CASE
    WHEN packages_sold >= total_packages THEN true
    ELSE false
  END AS is_sold_out
FROM experiences
WHERE is_active = true
ORDER BY display_order ASC;

-- View: Order details with items (for admin verification)
CREATE OR REPLACE VIEW order_details AS
SELECT
  o.id AS order_id,
  o.session_code,
  o.guest_name,
  o.guest_message,
  o.total_packages,
  o.payment_confirmed,
  o.created_at,
  json_agg(
    json_build_object(
      'experience_id', oi.experience_id,
      'title', e.title,
      'packages_count', oi.packages_count,
      'unit_price', e.unit_price
    )
  ) AS items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN experiences e ON oi.experience_id = e.id
GROUP BY o.id, o.session_code, o.guest_name, o.guest_message, o.total_packages, o.payment_confirmed, o.created_at
ORDER BY o.created_at DESC;

-- ============================================
-- NOTES FOR DEPLOYMENT
-- ============================================

-- 1. Run this schema in Supabase SQL Editor
-- 2. Insert initial data using seed.sql
-- 3. Set up Storage bucket for images (see SUPABASE_SETUP.md)
-- 4. Update frontend with your Supabase URL and anon key
-- 5. Test RLS policies work correctly
