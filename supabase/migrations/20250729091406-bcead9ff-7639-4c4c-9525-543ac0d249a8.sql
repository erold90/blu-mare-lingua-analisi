-- Update the check constraint to include the new 'introduction' category
ALTER TABLE public.images 
DROP CONSTRAINT IF EXISTS images_category_check;

ALTER TABLE public.images 
ADD CONSTRAINT images_category_check 
CHECK (category IN ('apartment', 'hero', 'home_gallery', 'introduction', 'social', 'favicon'));