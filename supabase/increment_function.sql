-- ============================================
-- ATOMIC INCREMENT FUNCTION
-- Safe way to increment packages_sold
-- ============================================

-- This function ensures that packages_sold is incremented atomically
-- preventing race conditions when multiple guests checkout simultaneously

CREATE OR REPLACE FUNCTION increment_packages_sold(
  experience_id TEXT,
  increment_by INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE experiences
  SET packages_sold = packages_sold + increment_by,
      updated_at = NOW()
  WHERE id = experience_id;

  -- Optional: Check if we oversold
  IF (SELECT packages_sold > total_packages FROM experiences WHERE id = experience_id) THEN
    RAISE EXCEPTION 'Cannot oversell packages for experience %', experience_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon role (public access)
GRANT EXECUTE ON FUNCTION increment_packages_sold(TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION increment_packages_sold(TEXT, INTEGER) TO authenticated;

-- Important: SECURITY DEFINER means the function runs with the creator's privileges
-- This allows anon users to update experiences.packages_sold even though
-- the RLS policy normally restricts updates to service_role only

-- ============================================
-- USAGE EXAMPLE
-- ============================================

-- When a guest purchases 2 packages of 'isla-magdalena':
-- SELECT increment_packages_sold('isla-magdalena', 2);

-- ============================================
-- TESTING
-- ============================================

-- Test the function (replace with actual experience_id from your seed data)
-- SELECT increment_packages_sold('santiago-del-cile', 1);

-- Verify it worked:
-- SELECT id, title, packages_sold, total_packages FROM experiences WHERE id = 'santiago-del-cile';
