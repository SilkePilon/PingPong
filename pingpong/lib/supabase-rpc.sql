-- Create a function to increment player stats
CREATE OR REPLACE FUNCTION increment_player_stats(
  p_id UUID,
  matches_played_inc INTEGER DEFAULT 0,
  matches_won_inc INTEGER DEFAULT 0,
  points_scored_inc INTEGER DEFAULT 0
) RETURNS VOID AS $$
BEGIN
  -- Check if stats exist for the player
  IF EXISTS (SELECT 1 FROM player_stats WHERE player_id = p_id) THEN
    -- Update existing stats
    UPDATE player_stats
    SET 
      matches_played = matches_played + matches_played_inc,
      matches_won = matches_won + matches_won_inc,
      total_points_scored = total_points_scored + points_scored_inc,
      updated_at = NOW()
    WHERE player_id = p_id;
  ELSE
    -- Insert new stats
    INSERT INTO player_stats (
      player_id, 
      matches_played, 
      matches_won, 
      total_points_scored
    ) VALUES (
      p_id, 
      matches_played_inc, 
      matches_won_inc, 
      points_scored_inc
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

