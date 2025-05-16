-- Create a function to safely create an admin user
CREATE OR REPLACE FUNCTION create_admin_user(target_email TEXT)
RETURNS void AS $$
BEGIN
  -- Update the user's profile to be an admin
  UPDATE public.profiles
  SET user_type = 'admin'
  WHERE email = target_email;
  
  -- Log the admin creation
  INSERT INTO public.admin_logs (action, target_email, performed_by)
  VALUES ('create_admin', target_email, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a table to log admin actions
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  target_email TEXT NOT NULL,
  performed_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (performed_by) REFERENCES auth.users(id)
);

-- Create policy to allow admins to view admin logs
CREATE POLICY "Admins can view admin logs"
ON public.admin_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  )
);

-- Create policy to allow admins to insert admin logs
CREATE POLICY "Admins can insert admin logs"
ON public.admin_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  )
); 