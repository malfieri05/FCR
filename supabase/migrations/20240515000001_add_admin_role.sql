-- Add admin role to user_type check constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_user_type_check
CHECK (user_type IN ('car_owner', 'mechanic', 'admin'));

-- Create admin dashboard access policy
CREATE POLICY "Admins can view all data"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  )
);

CREATE POLICY "Admins can view all mechanics"
ON public.mechanics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  )
);

CREATE POLICY "Admins can view all job requests"
ON public.job_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  )
);

CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  )
);

CREATE POLICY "Admins can view all reviews"
ON public.reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  )
); 