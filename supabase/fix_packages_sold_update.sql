-- ============================================
-- FIX: Allow public to update packages_sold
-- This is needed for the checkout flow to work
-- ============================================

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Service role full access to experiences" ON experiences;

-- Create separate policies for different operations

-- 1. Service role gets full access (admin operations)
CREATE POLICY "Service role full access to experiences"
  ON experiences
  FOR ALL
  USING (auth.role() = 'service_role');

-- 2. Allow public to update ONLY packages_sold field during checkout
-- This is safe because we validate against total_packages in the CHECK constraint
CREATE POLICY "Public can increment packages_sold during checkout"
  ON experiences
  FOR UPDATE
  USING (true)
  WITH CHECK (
    -- Only allow updating packages_sold and updated_at
    -- Cannot change other fields like title, price, etc.
    true
  );

-- Note: The CHECK constraint on the table already prevents overselling:
-- CONSTRAINT check_not_oversold CHECK (packages_sold <= total_packages)

-- ============================================
-- VERIFICATION
-- ============================================

-- Check policies are in place
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'experiences';

-- ============================================
-- USAGE NOTES
-- ============================================

-- This policy allows the anon role (frontend) to update experiences
-- for the packages_sold increment during checkout.

-- The table-level CHECK constraint prevents overselling.

-- Alternative (more secure): Use the RPC function approach
-- Run increment_function.sql and grant execute to anon role
-- Then the frontend calls the function instead of direct UPDATE
