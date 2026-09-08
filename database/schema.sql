-- ============================================================
-- DementiaScreen Database Schema
-- Research-inspired cognitive screening & monitoring platform
-- NOT a diagnostic system.
-- ============================================================

CREATE DATABASE IF NOT EXISTS dementia_screen
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dementia_screen;

-- ------------------------------------------------------------
-- USERS (login credentials, shared by health workers & admins)
-- ------------------------------------------------------------
CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    specialization  VARCHAR(100) NULL,
    role            ENUM('HEALTH_WORKER', 'ADMIN') NOT NULL DEFAULT 'HEALTH_WORKER',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- HEALTH_WORKERS (extra profile info tied 1:1 to a user)
-- ------------------------------------------------------------
CREATE TABLE health_workers (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    facility_name   VARCHAR(200),
    phone           VARCHAR(30),
    region          VARCHAR(150),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hw_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_hw_user (user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- PERSONS (the individuals being screened)
-- ------------------------------------------------------------
CREATE TABLE persons (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name           VARCHAR(150) NOT NULL,
    age                 INT NOT NULL,
    gender              ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NOT NULL,
    phone               VARCHAR(30),
    location             VARCHAR(200),
    emergency_contact_name  VARCHAR(150),
    emergency_contact_phone VARCHAR(30),
    consent_given       BOOLEAN NOT NULL DEFAULT FALSE,
    registered_by       BIGINT NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_person_registered_by FOREIGN KEY (registered_by) REFERENCES users(id),
    INDEX idx_person_name (full_name),
    INDEX idx_person_created (created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ASSESSMENT_SECTIONS (AD8 / RUDAS / PFAQ instrument definitions)
-- ------------------------------------------------------------
CREATE TABLE assessment_sections (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,   -- 'AD8', 'RUDAS', 'PFAQ'
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    max_score       DECIMAL(6,2) NOT NULL,
    review_cutoff   DECIMAL(6,2) NOT NULL,          -- score at/above (or per direction) that flags "review recommended"
    scoring_direction ENUM('HIGHER_IS_CONCERNING','LOWER_IS_CONCERNING') NOT NULL,
    version         VARCHAR(30) DEFAULT 'placeholder-v1',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- QUESTIONS (validated instrument items - content is configurable
-- and should be replaced with officially licensed wording)
-- ------------------------------------------------------------
CREATE TABLE questions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    section_id          BIGINT NOT NULL,
    order_index         INT NOT NULL,
    prompt_text         TEXT NOT NULL,
    response_type       ENUM('YES_NO','MULTIPLE_CHOICE','NUMERIC','TASK_SCORE') NOT NULL,
    options_json        JSON NULL,          -- for MULTIPLE_CHOICE/YES_NO option -> score mapping
    helper_text         VARCHAR(255) NULL,
    example_text        VARCHAR(255) NULL,
    max_item_score      DECIMAL(6,2) NOT NULL,
    is_placeholder       BOOLEAN NOT NULL DEFAULT TRUE, -- true until real validated wording is inserted
    CONSTRAINT fk_question_section FOREIGN KEY (section_id) REFERENCES assessment_sections(id) ON DELETE CASCADE,
    INDEX idx_question_section (section_id, order_index)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- SCREENINGS (one screening episode for one person)
-- ------------------------------------------------------------
CREATE TABLE screenings (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    person_id           BIGINT NOT NULL,
    conducted_by        BIGINT NOT NULL,
    status              ENUM('IN_PROGRESS','COMPLETED','SYNC_PENDING') NOT NULL DEFAULT 'IN_PROGRESS',
    started_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at        TIMESTAMP NULL,
    duration_seconds     INT NULL,
    is_offline_capture   BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_screening_person FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
    CONSTRAINT fk_screening_worker FOREIGN KEY (conducted_by) REFERENCES users(id),
    INDEX idx_screening_person (person_id),
    INDEX idx_screening_status (status),
    INDEX idx_screening_started (started_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ANSWERS (raw item-level responses for a screening)
-- ------------------------------------------------------------
CREATE TABLE answers (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    screening_id    BIGINT NOT NULL,
    question_id     BIGINT NOT NULL,
    response_value  VARCHAR(255) NOT NULL,
    item_score      DECIMAL(6,2) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_answer_screening FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES questions(id),
    UNIQUE KEY uq_answer_screening_question (screening_id, question_id),
    INDEX idx_answer_screening (screening_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- SCREENING_RESULTS (per-section + overall computed result)
-- ------------------------------------------------------------
CREATE TABLE screening_results (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    screening_id        BIGINT NOT NULL,
    section_id          BIGINT NOT NULL,
    raw_score            DECIMAL(6,2) NOT NULL,
    flagged_for_review   BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_result_screening FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE,
    CONSTRAINT fk_result_section FOREIGN KEY (section_id) REFERENCES assessment_sections(id),
    UNIQUE KEY uq_result_screening_section (screening_id, section_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- SCREENING_HISTORY (denormalized overall-outcome snapshot per
-- screening, used for fast trend/timeline queries)
-- ------------------------------------------------------------
CREATE TABLE screening_history (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    person_id           BIGINT NOT NULL,
    screening_id        BIGINT NOT NULL,
    overall_status       ENUM('LOW_CONCERN','REVIEW_RECOMMENDED') NOT NULL,
    ad8_score            DECIMAL(6,2),
    rudas_score           DECIMAL(6,2),
    pfaq_score            DECIMAL(6,2),
    recorded_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_person FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_screening FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE,
    INDEX idx_history_person (person_id, recorded_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- FOLLOW_UPS
-- ------------------------------------------------------------
CREATE TABLE follow_ups (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    person_id           BIGINT NOT NULL,
    screening_id        BIGINT NULL,
    created_by           BIGINT NOT NULL,
    status               ENUM('PENDING','SCHEDULED','COMPLETED','OVERDUE') NOT NULL DEFAULT 'PENDING',
    reason               VARCHAR(255),
    scheduled_date        DATE NULL,
    completed_at          TIMESTAMP NULL,
    notes                TEXT,
    created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_followup_person FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
    CONSTRAINT fk_followup_screening FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE SET NULL,
    CONSTRAINT fk_followup_creator FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_followup_status (status),
    INDEX idx_followup_person (person_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- AUDIT_LOGS
-- ------------------------------------------------------------
CREATE TABLE audit_logs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NULL,
    action          VARCHAR(150) NOT NULL,
    entity_type     VARCHAR(100),
    entity_id       BIGINT,
    details          TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;
