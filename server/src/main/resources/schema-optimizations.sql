-- ==============================================================================
-- Zenve Vet Database Optimizations for High-Scale (300,000 Users)
-- Target RDBMS: MySQL 8.0+
-- Adds compound and foreign key indexes to eliminate table scans under load.
-- ==============================================================================

USE zenvevet;

-- 1. Stories Indexing (Fast 24-hour expiration filter and doctor stories lookup)
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_doctor_created ON stories(doctor_id, created_at DESC);

-- 2. Story Views & Likes Indexing (Instant deduplication and viewers count queries)
CREATE INDEX IF NOT EXISTS idx_story_views_lookup ON story_views(story_id, viewer_doctor_id);
CREATE INDEX IF NOT EXISTS idx_story_views_created ON story_views(story_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_likes_lookup ON story_likes(story_id, doctor_id);

-- 3. Feed Posts Indexing (Instant feed timeline scrolling and category filtering)
CREATE INDEX IF NOT EXISTS idx_posts_timeline ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_doctor ON posts(doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type, created_at DESC);

-- 4. Post Comments & Likes Indexing
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_doctor ON comments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_post_likes ON post_likes(post_id, doctor_id);

-- 5. Chat Messages (High-speed sub-millisecond direct message loading)
CREATE INDEX IF NOT EXISTS idx_chat_conversation ON chat_messages(sender_id, receiver_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_chat_receiver ON chat_messages(receiver_id, timestamp DESC);

-- 6. Doctor Directory Search & Auth Indexing
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctor_profiles(email);
CREATE INDEX IF NOT EXISTS idx_doctors_phone ON doctor_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctor_profiles(specialty);

-- 7. Notifications Indexing
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_doctor_id, created_at DESC);
