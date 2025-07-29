-- Enable RLS policies for image management in admin area

-- Allow admins to insert images
CREATE POLICY "Admins can upload images" 
ON public.images 
FOR INSERT 
WITH CHECK (true);

-- Allow admins to update images
CREATE POLICY "Admins can update images" 
ON public.images 
FOR UPDATE 
USING (true);

-- Allow admins to delete images
CREATE POLICY "Admins can delete images" 
ON public.images 
FOR DELETE 
USING (true);