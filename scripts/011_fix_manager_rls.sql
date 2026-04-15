-- Fix RLS policies for managers to properly access data
-- Run this in Supabase SQL Editor

-- Drop and recreate the manager profile viewing policy with correct logic
DROP POLICY IF EXISTS "Managers and admins can view all profiles" ON public.profiles;

-- Create a policy that checks the role from the profiles table itself
CREATE POLICY "Managers and admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id  -- Users can always see their own profile
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('manager', 'admin')
    )
  );

-- Also add department column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;

-- Create index for department
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);

-- Verify the policies are correct
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
