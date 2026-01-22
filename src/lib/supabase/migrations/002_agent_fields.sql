-- ============================================
-- MIGRATION: Agent Fields and Audit Enhancements
-- ============================================
-- Extends existing schema to support agent execution traces
-- Adds fields for linking Supabase "facts" with MongoDB "thoughts"

-- Add agent-related columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS agent_run_id TEXT, -- Links to MongoDB agent_runs collection
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1), -- 0.00 to 1.00
ADD COLUMN IF NOT EXISTS reasoning_summary TEXT, -- Human-readable summary of agent reasoning
ADD COLUMN IF NOT EXISTS evidence_links TEXT[], -- Array of URLs agent referenced
ADD COLUMN IF NOT EXISTS proposed_at TIMESTAMP WITH TIME ZONE, -- When agent proposed the trade
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE, -- When human approved
ADD COLUMN IF NOT EXISTS approved_by TEXT REFERENCES profiles(id); -- Who approved (for multi-user later)

-- Create index on agent_run_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_agent_run_id ON orders(agent_run_id);

-- Create index on proposed_at for recent proposals queries
CREATE INDEX IF NOT EXISTS idx_orders_proposed_at ON orders(proposed_at DESC) WHERE proposed_at IS NOT NULL;

-- Add comment explaining the agent_run_id field
COMMENT ON COLUMN orders.agent_run_id IS 'Links to MongoDB agent_runs collection run_id field for full execution trace';

-- ============================================
-- AUDIT LOG ENHANCEMENTS
-- ============================================

-- Ensure audit_logs can handle agent-related actions
-- No schema changes needed, but document the new action types in comments

COMMENT ON COLUMN audit_logs.action IS 'Action type: user_created, user_updated, user_deleted, agent_analysis_requested, trade_proposed, trade_approved, trade_rejected';

-- Add index for filtering by action type (useful for admin analytics)
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Add index for filtering by timestamp (useful for "today's activity")
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get pending approvals count for a user
CREATE OR REPLACE FUNCTION get_pending_approvals_count(user_profile_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM orders
    WHERE user_id = user_profile_id
    AND status = 'proposed'
    AND proposed_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get agent stats for today (admin dashboard)
CREATE OR REPLACE FUNCTION get_today_agent_stats()
RETURNS TABLE (
  total_runs BIGINT,
  total_proposals BIGINT,
  total_approvals BIGINT,
  total_rejections BIGINT,
  avg_confidence DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE action = 'agent_analysis_requested') as total_runs,
    COUNT(*) FILTER (WHERE action = 'trade_proposed') as total_proposals,
    COUNT(*) FILTER (WHERE action = 'trade_approved') as total_approvals,
    COUNT(*) FILTER (WHERE action = 'trade_rejected') as total_rejections,
    (SELECT AVG(confidence_score) FROM orders WHERE proposed_at >= CURRENT_DATE) as avg_confidence
  FROM audit_logs
  WHERE created_at >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY UPDATES
-- ============================================

-- Orders table RLS already exists from migration 001
-- No changes needed - users can only see their own orders
-- Service role (used by API) bypasses RLS

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify new columns exist
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.columns 
          WHERE table_name = 'orders' AND column_name = 'agent_run_id') = 1,
         'agent_run_id column not added';
  ASSERT (SELECT COUNT(*) FROM information_schema.columns 
          WHERE table_name = 'orders' AND column_name = 'confidence_score') = 1,
         'confidence_score column not added';
  RAISE NOTICE '✅ Migration 002 completed successfully';
END $$;

