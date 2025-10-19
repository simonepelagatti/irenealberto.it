// ============================================
// SUPABASE CLIENT CONFIGURATION
// Irene & Alberto Wedding Gift Registry
// ============================================

// 🔧 CONFIGURATION: Replace these with your actual Supabase credentials
// Get these from: Supabase Dashboard → Settings → API
const SUPABASE_URL = 'https://mlgejxbrqtkmsvplqndg.supabase.co'; // e.g., 'https://xxxxxxxxxxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZ2VqeGJycXRrbXN2cGxxbmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDMxODEsImV4cCI6MjA3NjE3OTE4MX0.m9-ldtJnR8DboArg0NbhAuhDvjiUNTsaZgtY36lJwCg'; // Long string starting with 'eyJ...'

// ⚠️ IMPORTANT: The anon key is safe to expose in frontend code.
// It respects Row Level Security (RLS) policies.
// NEVER use the service_role key in frontend code.

// Initialize Supabase client using CDN
// Note: We're using the CDN version to avoid build tools
const { createClient } = supabase;

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch all available experiences from Supabase
 * @returns {Promise<Array>} Array of experience objects
 */
async function fetchExperiences() {
  try {
    const { data, error } = await supabaseClient
      .from('experiences')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching experiences:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching experiences:', err);
    return [];
  }
}

/**
 * Check availability of a specific experience
 * @param {string} experienceId - The experience ID
 * @returns {Promise<Object>} Object with { available: boolean, remaining: number }
 */
async function checkAvailability(experienceId) {
  try {
    const { data, error } = await supabaseClient
      .from('experiences')
      .select('total_packages, packages_sold')
      .eq('id', experienceId)
      .single();

    if (error) {
      console.error('Error checking availability:', error);
      return { available: false, remaining: 0 };
    }

    const remaining = data.total_packages - data.packages_sold;
    return {
      available: remaining > 0,
      remaining: remaining
    };
  } catch (err) {
    console.error('Exception checking availability:', err);
    return { available: false, remaining: 0 };
  }
}

/**
 * Create a new order with order items (checkout)
 * @param {Object} orderData - Order details
 * @param {string} orderData.sessionCode - Unique session code
 * @param {string} orderData.guestName - Guest name
 * @param {string} orderData.guestMessage - Optional message
 * @param {Array<Object>} orderData.items - Array of { experienceId, packagesCount }
 * @returns {Promise<Object>} { success: boolean, orderId: string, error?: string }
 */
async function createOrder({ sessionCode, guestName, guestMessage, items }) {
  try {
    // 1. Create the order
    const { data: orderData, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        session_code: sessionCode,
        guest_name: guestName,
        guest_message: guestMessage || null,
        total_packages: items.reduce((sum, item) => sum + (item.packagesCount || 1), 0)
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return { success: false, error: orderError.message };
    }

    const orderId = orderData.id;

    // 2. Create order items
    const orderItems = items.map(item => ({
      order_id: orderId,
      experience_id: item.experienceId,
      packages_count: item.packagesCount || 1
    }));

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Note: Order was created but items failed - might need manual cleanup
      return { success: false, error: itemsError.message };
    }

    // 3. Update packages_sold for each experience
    for (const item of items) {
      // Try RPC function first (if increment_function.sql was executed)
      const { error: rpcError } = await supabaseClient.rpc('increment_packages_sold', {
        experience_id: item.experienceId,
        increment_by: item.packagesCount || 1
      });

      // If RPC function doesn't exist, use manual read-modify-write
      if (rpcError && rpcError.code === '42883') {
        console.warn('⚠️ RPC function not found, using manual update. Consider running increment_function.sql');

        // Fetch current value
        const { data: expData, error: fetchError } = await supabaseClient
          .from('experiences')
          .select('packages_sold')
          .eq('id', item.experienceId)
          .single();

        if (fetchError) {
          console.error('Error fetching current packages_sold:', fetchError);
          continue;
        }

        // Update with incremented value
        const newCount = (expData.packages_sold || 0) + (item.packagesCount || 1);
        const { error: updateError } = await supabaseClient
          .from('experiences')
          .update({ packages_sold: newCount })
          .eq('id', item.experienceId);

        if (updateError) {
          console.error('Error updating packages_sold:', updateError);
        } else {
          console.log(`✅ Updated ${item.experienceId}: packages_sold = ${newCount}`);
        }
      } else if (rpcError) {
        console.error('Error calling RPC function:', rpcError);
      } else {
        console.log(`✅ Incremented ${item.experienceId} via RPC function`);
      }
    }

    return { success: true, orderId };

  } catch (err) {
    console.error('Exception creating order:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Verify an order exists by session code
 * @param {string} sessionCode - The session code to verify
 * @returns {Promise<Object>} Order data or null
 */
async function verifyOrder(sessionCode) {
  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items (
          packages_count,
          experiences (
            id,
            title,
            unit_price
          )
        )
      `)
      .eq('session_code', sessionCode)
      .single();

    if (error) {
      console.error('Error verifying order:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception verifying order:', err);
    return null;
  }
}

/**
 * Get storage URL for an experience image
 * @param {string} imageFilename - The image filename (e.g., 'santiago-del-cile.jpg')
 * @returns {string} Full public URL to the image
 */
function getImageUrl(imageFilename) {
  if (!imageFilename) return '';

  // If already a full URL, return as-is
  if (imageFilename.startsWith('http')) return imageFilename;

  // Construct Supabase Storage URL
  return `${SUPABASE_URL}/storage/v1/object/public/experience-images/${imageFilename}`;
}

// ============================================
// HELPER: Create RPC function for atomic increment
// Run this in Supabase SQL Editor if not already created:
// ============================================

/*
CREATE OR REPLACE FUNCTION increment_packages_sold(experience_id TEXT, increment_by INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE experiences
  SET packages_sold = packages_sold + increment_by
  WHERE id = experience_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

// ============================================
// EXPORT
// ============================================

// Make functions available globally (since we're not using modules)
window.supabaseAPI = {
  fetchExperiences,
  checkAvailability,
  createOrder,
  verifyOrder,
  getImageUrl,
  client: supabaseClient // Expose client for advanced usage
};

// Log connection status
console.log('✅ Supabase client initialized');
console.log('📡 Project URL:', SUPABASE_URL);

// Warn if not configured
if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
  console.warn('⚠️ Supabase not configured! Update SUPABASE_URL and SUPABASE_ANON_KEY in supabase-client.js');
}
