-- Drop the public read policy that exposes ballot secrecy
DROP POLICY IF EXISTS "Users can view all votes" ON public.votes;

-- Allow users to only verify their own vote exists
CREATE POLICY "Users can verify own vote existence"
ON public.votes FOR SELECT
USING (auth.uid() = user_id);

-- Create aggregated view for public vote counts (no user_id exposed)
CREATE VIEW public.vote_counts 
WITH (security_invoker = on) AS
SELECT election_id, candidate_id, COUNT(*) as vote_count
FROM public.votes
GROUP BY election_id, candidate_id;

-- Grant access to the view for all users
GRANT SELECT ON public.vote_counts TO authenticated;
GRANT SELECT ON public.vote_counts TO anon;