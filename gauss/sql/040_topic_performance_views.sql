-- Topic Performance Views for Student Analytics
-- Run this in Supabase SQL Editor
--
-- These views calculate student performance by topic, using gauss_attempts joined to gauss_questions.
-- Questions with multiple topics contribute to each topic separately.

-- Drop existing views if they exist
DROP VIEW IF EXISTS gauss_student_primary_topic_performance;
DROP VIEW IF EXISTS gauss_student_secondary_topic_performance;

-- Primary Topic Performance View
-- Aggregates student performance by primary topic
CREATE VIEW gauss_student_primary_topic_performance AS
SELECT
  ga.user_id,
  topic as primary_topic,
  COUNT(*) as attempted_count,
  SUM(CASE WHEN ga.is_correct = true THEN 1 ELSE 0 END) as correct_count,
  SUM(CASE WHEN ga.is_correct = false THEN 1 ELSE 0 END) as wrong_count,
  ROUND(
    SUM(CASE WHEN ga.is_correct = true THEN 1 ELSE 0 END)::numeric /
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

-- Secondary Topic Performance View
-- Aggregates student performance by secondary topic for drill-down analysis
CREATE VIEW gauss_student_secondary_topic_performance AS
SELECT
  ga.user_id,
  topic as secondary_topic,
  COUNT(*) as attempted_count,
  SUM(CASE WHEN ga.is_correct = true THEN 1 ELSE 0 END) as correct_count,
  SUM(CASE WHEN ga.is_correct = false THEN 1 ELSE 0 END) as wrong_count,
  ROUND(
    SUM(CASE WHEN ga.is_correct = true THEN 1 ELSE 0 END)::numeric /
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

-- Verify views were created
SELECT 'gauss_student_primary_topic_performance' as view_name, COUNT(*) as row_count
FROM gauss_student_primary_topic_performance
UNION ALL
SELECT 'gauss_student_secondary_topic_performance' as view_name, COUNT(*) as row_count
FROM gauss_student_secondary_topic_performance;
