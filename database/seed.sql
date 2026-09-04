-- ============================================================
-- DementiaScreen DEMO SEED DATA
-- All people below are FICTIONAL. Do not use real medical data.
-- Question wording is PLACEHOLDER ONLY — replace with officially
-- licensed AD8 / RUDAS / RUDAS-PE / PFAQ instrument text and
-- scoring rules before any real-world use.
-- ============================================================

USE dementia_screen;

-- ---------------- USERS ----------------
-- password for ALL demo accounts is: Password123!
-- (bcrypt hash generated at app startup — see README for how to regenerate)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@dementiascreen.demo',  '$2a$10$oCYJ22X3xJC8A8iUzQxZkOqSorQTdPxSan6SPjUW3WaCH4L4nOtIm', 'Ava Administrator', 'ADMIN'),
('worker1@dementiascreen.demo','$2a$10$oCYJ22X3xJC8A8iUzQxZkOqSorQTdPxSan6SPjUW3WaCH4L4nOtIm', 'Priya Sharma', 'HEALTH_WORKER'),
('worker2@dementiascreen.demo','$2a$10$oCYJ22X3xJC8A8iUzQxZkOqSorQTdPxSan6SPjUW3WaCH4L4nOtIm', 'Daniel Okafor', 'HEALTH_WORKER');

INSERT INTO health_workers (user_id, facility_name, phone, region) VALUES
(2, 'Riverside Community Clinic', '+91-90000-00001', 'West District'),
(3, 'Northgate Health Post', '+91-90000-00002', 'North District');

-- ---------------- ASSESSMENT SECTIONS ----------------
INSERT INTO assessment_sections (code, name, description, max_score, review_cutoff, scoring_direction, version) VALUES
('AD8', 'AD8 Informant/Self Interview', 'Brief 8-item change-detection screen. PLACEHOLDER scoring cutoff pending validated source.', 8, 2, 'HIGHER_IS_CONCERNING', 'placeholder-v1'),
('RUDAS', 'RUDAS / RUDAS-PE Cognitive Assessment', 'Multicultural cognitive assessment across memory, orientation, praxis, visuospatial, judgment, and language. PLACEHOLDER scoring cutoff pending validated source.', 30, 22, 'LOWER_IS_CONCERNING', 'placeholder-v1'),
('PFAQ', 'Pfeffer Functional Activities Questionnaire', 'Informant-rated functional independence in daily activities. PLACEHOLDER scoring cutoff pending validated source.', 30, 6, 'HIGHER_IS_CONCERNING', 'placeholder-v1');

-- ---------------- QUESTIONS (placeholders) ----------------
-- AD8 (section_id = 1) — 8 items, Yes(=1)/No(=0), "Yes" indicates a change
INSERT INTO questions (section_id, order_index, prompt_text, response_type, options_json, max_item_score, is_placeholder) VALUES
(1, 1, '[Validated AD8 item 1 will be inserted here]', 'YES_NO', '{"Yes":1,"No":0}', 1, TRUE),
(1, 2, '[Validated AD8 item 2 will be inserted here]', 'YES_NO', '{"Yes":1,"No":0}', 1, TRUE),
(1, 3, '[Validated AD8 item 3 will be inserted here]', 'YES_NO', '{"Yes":1,"No":0}', 1, TRUE),
(1, 4, '[Validated AD8 item 4 will be inserted here]', 'YES_NO', '{"Yes":1,"No":0}', 1, TRUE),
(1, 5, '[Validated AD8 item 5 will be inserted here]', 'YES_NO', '{"Yes":1,"No":0}', 1, TRUE),
(1, 6, '[Validated AD8 item 6 will be inserted here]', 'YES_NO', '{"Yes":1,"No":0}', 1, TRUE),
(1, 7, '[Validated AD8 item 7 will be inserted here]', 'YES_NO', '{"Yes":1,"No":0}', 1, TRUE),
(1, 8, '[Validated AD8 item 8 will be inserted here]', 'YES_NO', '{"Yes":1,"No":0}', 1, TRUE);

-- RUDAS (section_id = 2) — 6 placeholder task categories
INSERT INTO questions (section_id, order_index, prompt_text, response_type, options_json, max_item_score, is_placeholder) VALUES
(2, 1, '[Validated RUDAS memory task will be inserted here]', 'TASK_SCORE', NULL, 8, TRUE),
(2, 2, '[Validated RUDAS orientation task will be inserted here]', 'TASK_SCORE', NULL, 5, TRUE),
(2, 3, '[Validated RUDAS praxis task will be inserted here]', 'TASK_SCORE', NULL, 4, TRUE),
(2, 4, '[Validated RUDAS visuospatial task will be inserted here]', 'TASK_SCORE', NULL, 5, TRUE),
(2, 5, '[Validated RUDAS judgment task will be inserted here]', 'TASK_SCORE', NULL, 4, TRUE),
(2, 6, '[Validated RUDAS language task will be inserted here]', 'TASK_SCORE', NULL, 4, TRUE);

-- PFAQ (section_id = 3) — 10 placeholder functional items, 0-3 scale
INSERT INTO questions (section_id, order_index, prompt_text, response_type, options_json, max_item_score, is_placeholder) VALUES
(3, 1, '[Validated PFAQ item 1 will be inserted here]', 'MULTIPLE_CHOICE', '{"Normal":0,"Has difficulty but does by self":1,"Requires assistance":2,"Dependent":3}', 3, TRUE),
(3, 2, '[Validated PFAQ item 2 will be inserted here]', 'MULTIPLE_CHOICE', '{"Normal":0,"Has difficulty but does by self":1,"Requires assistance":2,"Dependent":3}', 3, TRUE),
(3, 3, '[Validated PFAQ item 3 will be inserted here]', 'MULTIPLE_CHOICE', '{"Normal":0,"Has difficulty but does by self":1,"Requires assistance":2,"Dependent":3}', 3, TRUE),
(3, 4, '[Validated PFAQ item 4 will be inserted here]', 'MULTIPLE_CHOICE', '{"Normal":0,"Has difficulty but does by self":1,"Requires assistance":2,"Dependent":3}', 3, TRUE),
(3, 5, '[Validated PFAQ item 5 will be inserted here]', 'MULTIPLE_CHOICE', '{"Normal":0,"Has difficulty but does by self":1,"Requires assistance":2,"Dependent":3}', 3, TRUE),
(3, 6, '[Validated PFAQ item 6 will be inserted here]', 'MULTIPLE_CHOICE', '{"Normal":0,"Has difficulty but does by self":1,"Requires assistance":2,"Dependent":3}', 3, TRUE),
(3, 7, '[Validated PFAQ item 7 will be inserted here]', 'MULTIPLE_CHOICE', '{"Normal":0,"Has difficulty but does by self":1,"Requires assistance":2,"Dependent":3}', 3, TRUE),
(3, 8, '[Validated PFAQ item 8 will be inserted here]', 'MULTIPLE_CHOICE', '{"Normal":0,"Has difficulty but does by self":1,"Requires assistance":2,"Dependent":3}', 3, TRUE),
(3, 9, '[Validated PFAQ item 9 will be inserted here]', 'MULTIPLE_CHOICE', '{"Normal":0,"Has difficulty but does by self":1,"Requires assistance":2,"Dependent":3}', 3, TRUE),
(3, 10, '[Validated PFAQ item 10 will be inserted here]', 'MULTIPLE_CHOICE', '{"Normal":0,"Has difficulty but does by self":1,"Requires assistance":2,"Dependent":3}', 3, TRUE);

-- ---------------- DEMO PERSONS (10 fictional people) ----------------
INSERT INTO persons (full_name, age, gender, phone, location, emergency_contact_name, emergency_contact_phone, consent_given, registered_by) VALUES
('Fictional Person A - Meera Nair', 72, 'FEMALE', '+91-90000-10001', 'West District', 'Anil Nair', '+91-90000-10002', TRUE, 2),
('Fictional Person B - Ram Prasad', 68, 'MALE', '+91-90000-10003', 'West District', 'Sunita Prasad', '+91-90000-10004', TRUE, 2),
('Fictional Person C - Grace Owusu', 75, 'FEMALE', '+91-90000-10005', 'North District', 'Kwame Owusu', '+91-90000-10006', TRUE, 3),
('Fictional Person D - John Mensah', 80, 'MALE', '+91-90000-10007', 'North District', 'Ama Mensah', '+91-90000-10008', TRUE, 3),
('Fictional Person E - Lakshmi Iyer', 66, 'FEMALE', '+91-90000-10009', 'West District', 'Ravi Iyer', '+91-90000-10010', TRUE, 2),
('Fictional Person F - Peter Chen', 77, 'MALE', '+91-90000-10011', 'West District', 'Lily Chen', '+91-90000-10012', TRUE, 2),
('Fictional Person G - Fatima Bello', 70, 'FEMALE', '+91-90000-10013', 'North District', 'Musa Bello', '+91-90000-10014', TRUE, 3),
('Fictional Person H - George Antonio', 84, 'MALE', '+91-90000-10015', 'North District', 'Maria Antonio', '+91-90000-10016', TRUE, 3),
('Fictional Person I - Asha Verma', 69, 'FEMALE', '+91-90000-10017', 'West District', 'Deepak Verma', '+91-90000-10018', TRUE, 2),
('Fictional Person J - Samuel Boateng', 73, 'MALE', '+91-90000-10019', 'North District', 'Efua Boateng', '+91-90000-10020', TRUE, 3);

-- ---------------- DEMO SCREENINGS (one completed screening per person) ----------------
INSERT INTO screenings (person_id, conducted_by, status, started_at, completed_at, duration_seconds, is_offline_capture) VALUES
(1, 2, 'COMPLETED', '2026-06-01 09:00:00', '2026-06-01 09:22:00', 1320, FALSE),
(2, 2, 'COMPLETED', '2026-06-02 10:00:00', '2026-06-02 10:19:00', 1140, FALSE),
(3, 3, 'COMPLETED', '2026-06-03 11:00:00', '2026-06-03 11:25:00', 1500, FALSE),
(4, 3, 'COMPLETED', '2026-06-04 09:30:00', '2026-06-04 09:58:00', 1680, TRUE),
(5, 2, 'COMPLETED', '2026-06-05 14:00:00', '2026-06-05 14:20:00', 1200, FALSE),
(6, 2, 'COMPLETED', '2026-06-06 15:00:00', '2026-06-06 15:24:00', 1440, FALSE),
(7, 3, 'COMPLETED', '2026-06-07 09:00:00', '2026-06-07 09:21:00', 1260, FALSE),
(8, 3, 'COMPLETED', '2026-06-08 10:00:00', '2026-06-08 10:30:00', 1800, TRUE),
(9, 2, 'COMPLETED', '2026-06-09 11:00:00', '2026-06-09 11:18:00', 1080, FALSE),
(10, 3, 'COMPLETED', '2026-06-10 13:00:00', '2026-06-10 13:26:00', 1560, FALSE);

-- ---------------- DEMO RESULTS ----------------
INSERT INTO screening_results (screening_id, section_id, raw_score, flagged_for_review) VALUES
(1, 1, 1, FALSE), (1, 2, 26, FALSE), (1, 3, 3, FALSE),
(2, 1, 4, TRUE),  (2, 2, 19, TRUE),  (2, 3, 9, TRUE),
(3, 1, 0, FALSE), (3, 2, 28, FALSE), (3, 3, 1, FALSE),
(4, 1, 3, TRUE),  (4, 2, 21, TRUE),  (4, 3, 7, TRUE),
(5, 1, 1, FALSE), (5, 2, 27, FALSE), (5, 3, 2, FALSE),
(6, 1, 2, FALSE), (6, 2, 24, FALSE), (6, 3, 4, FALSE),
(7, 1, 5, TRUE),  (7, 2, 18, TRUE),  (7, 3, 10, TRUE),
(8, 1, 0, FALSE), (8, 2, 29, FALSE), (8, 3, 0, FALSE),
(9, 1, 3, TRUE),  (9, 2, 20, TRUE),  (9, 3, 6, TRUE),
(10, 1, 1, FALSE),(10, 2, 25, FALSE),(10, 3, 3, FALSE);

-- ---------------- DEMO HISTORY ----------------
INSERT INTO screening_history (person_id, screening_id, overall_status, ad8_score, rudas_score, pfaq_score, recorded_at) VALUES
(1, 1, 'LOW_CONCERN', 1, 26, 3, '2026-06-01 09:22:00'),
(2, 2, 'REVIEW_RECOMMENDED', 4, 19, 9, '2026-06-02 10:19:00'),
(3, 3, 'LOW_CONCERN', 0, 28, 1, '2026-06-03 11:25:00'),
(4, 4, 'REVIEW_RECOMMENDED', 3, 21, 7, '2026-06-04 09:58:00'),
(5, 5, 'LOW_CONCERN', 1, 27, 2, '2026-06-05 14:20:00'),
(6, 6, 'LOW_CONCERN', 2, 24, 4, '2026-06-06 15:24:00'),
(7, 7, 'REVIEW_RECOMMENDED', 5, 18, 10, '2026-06-07 09:21:00'),
(8, 8, 'LOW_CONCERN', 0, 29, 0, '2026-06-08 10:30:00'),
(9, 9, 'REVIEW_RECOMMENDED', 3, 20, 6, '2026-06-09 11:18:00'),
(10, 10, 'LOW_CONCERN', 1, 25, 3, '2026-06-10 13:26:00');

-- ---------------- DEMO FOLLOW-UPS ----------------
INSERT INTO follow_ups (person_id, screening_id, created_by, status, reason, scheduled_date, notes) VALUES
(2, 2, 2, 'PENDING', 'Recent screening requires professional review', '2026-06-20', 'DEMO DATA'),
(4, 4, 3, 'SCHEDULED', 'Recent screening requires professional review', '2026-06-18', 'DEMO DATA'),
(7, 7, 3, 'OVERDUE', 'Follow-up overdue', '2026-06-12', 'DEMO DATA'),
(9, 9, 2, 'PENDING', 'Recent screening requires professional review', '2026-06-25', 'DEMO DATA');
