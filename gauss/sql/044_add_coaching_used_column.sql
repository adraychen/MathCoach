-- Add coaching_used column to gauss_attempts
-- Run this in Supabase SQL Editor

-- Add the column
ALTER TABLE gauss_attempts
ADD COLUMN IF NOT EXISTS coaching_used boolean DEFAULT false;

-- Update the topic performance view to treat coaching_used as not correct
DROP VIEW IF EXISTS gauss_student_primary_topic_performance;

CREATE VIEW gauss_student_primary_topic_performance AS
SELECT
  ga.user_id,
  topic as primary_topic,
  COUNT(*) as attempted_count,
  -- Only count as correct if is_correct=true AND coaching was NOT used
  SUM(CASE WHEN ga.is_correct = true AND COALESCE(ga.coaching_used, false) = false THEN 1 ELSE 0 END) as correct_count,
  -- Count as wrong if is_correct=false OR coaching was used
  SUM(CASE WHEN ga.is_correct = false OR COALESCE(ga.coaching_used, false) = true THEN 1 ELSE 0 END) as wrong_count,
  ROUND(
    SUM(CASE WHEN ga.is_correct = true AND COALESCE(ga.coaching_used, false) = false THEN 1 ELSE 0 END)::numeric /
    NULLIF(COUNT(*)::numeric, 0),
    2
  ) as accuracy_rate
FROM gauss_attempts ga
JOIN gauss_questions gq ON ga.question_id = gq.id
CROSS JOIN LATERAL unnest(gq.primary_topics) as topic
WHERE ga.is_correct IS NOT NULL
  AND gq.primary_topics IS NOT NULL
  AND array_length(gq.primary_topics, 1) > 0
GROUP BY ga.user_id, topic;

-- Update secondary topic view as well
DROP VIEW IF EXISTS gauss_student_secondary_topic_performance;

CREATE VIEW gauss_student_secondary_topic_performance AS
SELECT
  ga.user_id,
  topic as secondary_topic,
  COUNT(*) as attempted_count,
  SUM(CASE WHEN ga.is_correct = true AND COALESCE(ga.coaching_used, false) = false THEN 1 ELSE 0 END) as correct_count,
  SUM(CASE WHEN ga.is_correct = false OR COALESCE(ga.coaching_used, false) = true THEN 1 ELSE 0 END) as wrong_count,
  ROUND(
    SUM(CASE WHEN ga.is_correct = true AND COALESCE(ga.coaching_used, false) = false THEN 1 ELSE 0 END)::numeric /
    NULLIF(COUNT(*)::numeric, 0),
    2
  ) as accuracy_rate
FROM gauss_attempts ga
JOIN gauss_questions gq ON ga.question_id = gq.id
CROSS JOIN LATERAL unnest(gq.secondary_topics) as topic
WHERE ga.is_correct IS NOT NULL
  AND gq.secondary_topics IS NOT NULL
  AND array_length(gq.secondary_topics, 1) > 0
GROUP BY ga.user_id, topic;

-- Grant access to authenticated users
GRANT SELECT ON gauss_student_primary_topic_performance TO authenticated;
GRANT SELECT ON gauss_student_secondary_topic_performance TO authenticated;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'gauss_attempts' AND column_name = 'coaching_used';
