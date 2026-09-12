-- ============================================================
-- BODHIX Guest Session Isolation — PostgreSQL (Supabase) migration
-- Idempotent and safe to re-run on existing production data.
--
-- Provides:
--   * per-session temporary-user flag, session id, expiry time
--   * index for efficient cleanup queries
--   * ON DELETE CASCADE from guest-owned data back to users
--
-- Safe with existing rows: new columns default FALSE/NULL, so all
-- current doctors/persons/screenings are unaffected.
-- ============================================================

-- ---------- 1. users: temporary-account columns ----------
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_temporary BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_id VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NULL;


-- ---------- 2. Safely (re)create FK constraints with ON DELETE CASCADE ----------
-- Each block drops any existing FK on (table,column), deletes orphaned rows,
-- then adds the CASCADE constraint. Idempotent and re-run safe.

-- 2a. persons.registered_by -> users(id)  ON DELETE CASCADE
DO $$
DECLARE cname text;
BEGIN
    SELECT tc.constraint_name INTO cname
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema='public' AND tc.table_name='persons'
      AND tc.constraint_type='FOREIGN KEY' AND kcu.column_name='registered_by';
    IF cname IS NOT NULL THEN EXECUTE 'ALTER TABLE persons DROP CONSTRAINT '||quote_ident(cname); END IF;
    DELETE FROM persons WHERE registered_by IS NOT NULL AND registered_by NOT IN (SELECT id FROM users);
    ALTER TABLE persons ADD CONSTRAINT fk_person_registered_by
        FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE CASCADE;
END$$;

-- 2b. screenings.conducted_by -> users(id)  ON DELETE CASCADE
DO $$
DECLARE cname text;
BEGIN
    SELECT tc.constraint_name INTO cname
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema='public' AND tc.table_name='screenings'
      AND tc.constraint_type='FOREIGN KEY' AND kcu.column_name='conducted_by';
    IF cname IS NOT NULL THEN EXECUTE 'ALTER TABLE screenings DROP CONSTRAINT '||quote_ident(cname); END IF;
    DELETE FROM screenings WHERE conducted_by IS NOT NULL AND conducted_by NOT IN (SELECT id FROM users);
    ALTER TABLE screenings ADD CONSTRAINT fk_screening_conducted_by
        FOREIGN KEY (conducted_by) REFERENCES users(id) ON DELETE CASCADE;
END$$;

-- 2c. screenings.person_id -> persons(id)  ON DELETE CASCADE
DO $$
DECLARE cname text;
BEGIN
    SELECT tc.constraint_name INTO cname
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema='public' AND tc.table_name='screenings'
      AND tc.constraint_type='FOREIGN KEY' AND kcu.column_name='person_id';
    IF cname IS NOT NULL THEN EXECUTE 'ALTER TABLE screenings DROP CONSTRAINT '||quote_ident(cname); END IF;
    DELETE FROM screenings WHERE person_id IS NOT NULL AND person_id NOT IN (SELECT id FROM persons);
    ALTER TABLE screenings ADD CONSTRAINT fk_screening_person
        FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE;
END$$;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = 'idx_users_temporary_expires'
    ) THEN
        CREATE INDEX idx_users_temporary_expires ON users (is_temporary, expires_at);
    END IF;
END$$;

-- 2d. follow_ups.created_by -> users(id)  ON DELETE SET NULL
DO $$
DECLARE cname text;
BEGIN
    SELECT tc.constraint_name INTO cname
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema='public' AND tc.table_name='follow_ups'
      AND tc.constraint_type='FOREIGN KEY' AND kcu.column_name='created_by';
    IF cname IS NOT NULL THEN EXECUTE 'ALTER TABLE follow_ups DROP CONSTRAINT '||quote_ident(cname); END IF;
    DELETE FROM follow_ups WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM users);
    ALTER TABLE follow_ups ADD CONSTRAINT fk_followup_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
END$$;

-- 2e. follow_ups.person_id -> persons(id)  ON DELETE CASCADE
DO $$
DECLARE cname text;
BEGIN
    SELECT tc.constraint_name INTO cname
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema='public' AND tc.table_name='follow_ups'
      AND tc.constraint_type='FOREIGN KEY' AND kcu.column_name='person_id';
    IF cname IS NOT NULL THEN EXECUTE 'ALTER TABLE follow_ups DROP CONSTRAINT '||quote_ident(cname); END IF;
    DELETE FROM follow_ups WHERE person_id IS NOT NULL AND person_id NOT IN (SELECT id FROM persons);
    ALTER TABLE follow_ups ADD CONSTRAINT fk_followup_person
        FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE;
END$$;

-- 2f. follow_ups.screening_id -> screenings(id)  ON DELETE SET NULL
DO $$
DECLARE cname text;
BEGIN
    SELECT tc.constraint_name INTO cname
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema='public' AND tc.table_name='follow_ups'
      AND tc.constraint_type='FOREIGN KEY' AND kcu.column_name='screening_id';
    IF cname IS NOT NULL THEN EXECUTE 'ALTER TABLE follow_ups DROP CONSTRAINT '||quote_ident(cname); END IF;
    ALTER TABLE follow_ups ADD CONSTRAINT fk_followup_screening
        FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE SET NULL;
END$$;

-- 2g. screening_results.screening_id -> screenings(id)  ON DELETE CASCADE
DO $$
DECLARE cname text;
BEGIN
    SELECT tc.constraint_name INTO cname
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema='public' AND tc.table_name='screening_results'
      AND tc.constraint_type='FOREIGN KEY' AND kcu.column_name='screening_id';
    IF cname IS NOT NULL THEN EXECUTE 'ALTER TABLE screening_results DROP CONSTRAINT '||quote_ident(cname); END IF;
    DELETE FROM screening_results WHERE screening_id IS NOT NULL AND screening_id NOT IN (SELECT id FROM screenings);
    ALTER TABLE screening_results ADD CONSTRAINT fk_result_screening
        FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE;
END$$;

-- 2h. screening_history.person_id -> persons(id)  ON DELETE CASCADE
DO $$
DECLARE cname text;
BEGIN
    SELECT tc.constraint_name INTO cname
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema='public' AND tc.table_name='screening_history'
      AND tc.constraint_type='FOREIGN KEY' AND kcu.column_name='person_id';
    IF cname IS NOT NULL THEN EXECUTE 'ALTER TABLE screening_history DROP CONSTRAINT '||quote_ident(cname); END IF;
    DELETE FROM screening_history WHERE person_id IS NOT NULL AND person_id NOT IN (SELECT id FROM persons);
    ALTER TABLE screening_history ADD CONSTRAINT fk_history_person
        FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE;
END$$;

-- 2i. screening_history.screening_id -> screenings(id)  ON DELETE SET NULL
DO $$
DECLARE cname text;
BEGIN
    SELECT tc.constraint_name INTO cname
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema='public' AND tc.table_name='screening_history'
      AND tc.constraint_type='FOREIGN KEY' AND kcu.column_name='screening_id';
    IF cname IS NOT NULL THEN EXECUTE 'ALTER TABLE screening_history DROP CONSTRAINT '||quote_ident(cname); END IF;
    ALTER TABLE screening_history ADD CONSTRAINT fk_history_screening
        FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE SET NULL;
END$$;

-- ---------- 3. Indexes on FK columns used by cleanup/lookup queries ----------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_persons_registered_by')
    THEN CREATE INDEX idx_persons_registered_by ON persons (registered_by); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_screenings_conducted_by')
    THEN CREATE INDEX idx_screenings_conducted_by ON screenings (conducted_by); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_followups_created_by')
    THEN CREATE INDEX idx_followups_created_by ON follow_ups (created_by); END IF;
END$$;