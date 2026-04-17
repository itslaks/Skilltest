-- IMMEDIATE FIX: Run this in Supabase SQL Editor
-- This addresses the specific error you encountered

-- Step 1: Drop the policy that's causing the dependency error
DROP POLICY "Users can view approved questions" ON public.questions;

-- Step 2: Drop any other policies that might reference these columns
DROP POLICY IF EXISTS "Users can view questions" ON public.questions;
DROP POLICY IF EXISTS "Employees can view approved questions" ON public.questions;

-- Step 3: Drop the index
DROP INDEX IF EXISTS idx_questions_is_approved;

-- Step 4: Now drop the columns (use CASCADE to force removal)
ALTER TABLE public.questions 
DROP COLUMN IF EXISTS is_approved CASCADE,
DROP COLUMN IF EXISTS status CASCADE;

-- Step 5: Create new policy without approval filter
CREATE POLICY "Users can view questions for active quizzes" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q 
      WHERE q.id = quiz_id AND q.is_active = true
    )
  );

-- Verify success
SELECT 'Approval system removed successfully!' AS result;
