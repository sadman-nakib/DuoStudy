
-- 1. Tasks Table: Daily shared goals
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    completed_a BOOLEAN DEFAULT FALSE,
    completed_b BOOLEAN DEFAULT FALSE,
    is_due_a BOOLEAN DEFAULT FALSE,
    is_due_b BOOLEAN DEFAULT FALSE,
    created_at BIGINT NOT NULL
);

-- 2. Stats Table: Tracking time for both users
CREATE TABLE stats (
    user_id TEXT PRIMARY KEY,
    total_study_time BIGINT DEFAULT 0,
    last_reset TEXT NOT NULL
);

-- 3. Settings Table: Names and active role (Uses ID 1 for persistent global state)
CREATE TABLE settings (
    id BIGINT PRIMARY KEY,
    name_a TEXT DEFAULT 'Partner 1',
    name_b TEXT DEFAULT 'Partner 2',
    current_user_id TEXT DEFAULT 'user_a',
    theme TEXT DEFAULT 'light'
);

-- Initialize global settings row
INSERT INTO settings (id, name_a, name_b, current_user_id, theme)
VALUES (1, 'Partner 1', 'Partner 2', 'user_a', 'light')
ON CONFLICT (id) DO NOTHING;

-- 4. History Table: Archives of past days' progress
CREATE TABLE history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    date TEXT NOT NULL,
    tasks JSONB NOT NULL,
    stats JSONB NOT NULL
);

-- 5. Notifications Table: Syncing alerts between partners
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    for_user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    read BOOLEAN DEFAULT FALSE
);

-- 6. Exams Table: Long-term goals and syllabus tracking
CREATE TABLE exams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    tasks JSONB DEFAULT '[]'::jsonb
);

-- Enable Realtime for all tables to allow live updates
-- This ensures that when one partner completes a task, it updates on the other's screen instantly.
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE stats;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE exams;
