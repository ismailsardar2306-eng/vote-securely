-- Add explicit DELETE deny policy to votes table to prevent vote deletion
-- This is critical for election integrity - votes should never be deleted
CREATE POLICY "No one can delete votes" 
ON public.votes 
FOR DELETE 
USING (false);