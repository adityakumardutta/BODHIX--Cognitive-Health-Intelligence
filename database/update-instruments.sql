-- ============================================================
-- RUDAS: replace placeholders with the validated task structure
-- (Rowland Universal Dementia Assessment Scale, Storey et al. 2004)
-- 6 tasks, total 0-30, lower is concerning, cutoff <=22 (existing config)
-- Memory 8 | Body orientation 8 | Praxis 3 | Cube copy 5 | Judgement 3 | Language 3
-- ============================================================
UPDATE questions SET prompt_text = 'Task 1 - Memory (registration and delayed recall), 0-8 points: Say to the person: "I am going to say four words from a shopping list. Listen carefully and repeat them after me." Administer the four standard RUDAS shopping-list words exactly as specified in the official RUDAS administration manual, then continue with the remaining tasks. At the end, ask: "Which were the four words I asked you to remember?"',
helper_text = 'Scoring: immediate registration out of 4, plus delayed recall out of 4. Record how many words were repeated correctly at registration and how many were recalled at the end. Do not use the words again in conversation during the assessment.',
example_text = 'The person repeats all four words immediately (registration 4/4). After the other tasks, they recall only two of them (recall 2/4). Total memory score: 6/8.',
response_type = 'TASK_SCORE', max_item_score = 8.00, is_placeholder = 0 WHERE id = 9;

UPDATE questions SET prompt_text = 'Task 2 - Body orientation (visuospatial), 0-8 points: Give the standard RUDAS body-orientation commands, which involve pointing to or showing parts of the body, including commands that cross the midline (for example, using one hand to touch or indicate the opposite side). Score each command as instructed in the official administration manual: 1 point for each correct response.',
helper_text = 'This task measures knowing where their body is in space. Score each command: correct response = 1 point, incorrect or unable = 0. Give the commands calmly and do not demonstrate them yourself.',
example_text = 'Correctly showing a body part on the opposite side scores 1 point. If they use the wrong hand or side, score 0 for that command.',
response_type = 'TASK_SCORE', max_item_score = 8.00, is_placeholder = 0 WHERE id = 10;

UPDATE questions SET prompt_text = 'Task 3 - Praxis (motor), 0-3 points: Ask the person to perform the standard RUDAS motor tasks, including demonstrating walking at a moderate pace and the two-hand coordination movements. Score 1 point for each task performed correctly.',
helper_text = 'This task checks the ability to carry out a physical action on request. Score each motor task: performed correctly = 1 point, not performed correctly = 0. Demonstrate the movement only if the manual instructs it, and never repeat the demonstration during scoring.',
example_text = 'If they walk at a normal, moderate pace without shuffling or stopping, that task scores 1 point.',
response_type = 'TASK_SCORE', max_item_score = 3.00, is_placeholder = 0 WHERE id = 11;

UPDATE questions SET prompt_text = 'Task 4 - Visuoconstruction (cube copy), 0-5 points: Place a sheet of A4 paper in front of the person and ask them to copy the standard RUDAS cube (lateral edges of 12 cm drawn at a 45-degree angle). Do not help, correct, or comment while they draw. Score the drawing 0-5 using the official RUDAS cube-copy scoring criteria.',
helper_text = 'This task measures drawing what they see. Score only what is on the paper, using the official scoring criteria (edges, angles, 3D shape). Common errors such as drawing flat lines or extra shapes lose points.',
example_text = 'A drawing with all edges in the correct position scores high; a flat or distorted shape scores low, following the official criteria.',
response_type = 'TASK_SCORE', max_item_score = 5.00, is_placeholder = 0 WHERE id = 12;

UPDATE questions SET prompt_text = 'Task 5 - Judgement (problem solving), 0-3 points: Present the standard RUDAS judgement scenario to the person (a common everyday problem situation, such as what they would do at traffic lights). Score their answer 0-3 according to the official RUDAS judgement scoring criteria.',
helper_text = 'This task measures practical problem solving and common sense in an everyday situation. Score the quality and safety of their solution: fully appropriate = 3, partially appropriate = 2, inappropriate or unsafe = 1 or 0, following the official criteria.',
example_text = 'A safe, sensible answer that shows they understand the situation scores high; a confused or dangerous answer scores low.',
response_type = 'TASK_SCORE', max_item_score = 3.00, is_placeholder = 0 WHERE id = 13;

UPDATE questions SET prompt_text = 'Task 6 - Language (semantic verbal fluency), 0-3 points: Ask the person to name as many different kinds of animals as they can in one minute. Give no further hints. Score 0-3 according to the official RUDAS fluency scoring criteria.',
helper_text = 'This task measures how easily they can produce words in a category. Count only different animals; repeats do not count. Score per the official criteria for the number of distinct animals named in one minute.',
example_text = '"Cow, dog, horse, fish" = four distinct animals; repeating "cow" again does not add a point.',
response_type = 'TASK_SCORE', max_item_score = 3.00, is_placeholder = 0 WHERE id = 14;

-- ============================================================
-- PFAQ: official Pfeffer Functional Activities Questionnaire items
-- with validated 0-3 scale plus the validated never-did handling
-- ============================================================
SET @pfaq_options = '{"Normal": 0, "Has difficulty but does by self": 1, "Requires assistance": 2, "Dependent": 3, "Never did this activity, but could do it now": 0, "Never did this activity, and would have difficulty now": 1}';

UPDATE questions SET prompt_text = 'Writing checks, paying bills, or balancing a checkbook.',
helper_text = 'How independently does this person handle money and bills compared with how they used to?',
example_text = 'For example: paying electricity bills, writing cheques, keeping track of money they have spent.',
options_json = @pfaq_options, is_placeholder = 0 WHERE id = 15;

UPDATE questions SET prompt_text = 'Assembling tax records, business affairs, or papers.',
helper_text = 'How independently does this person handle paperwork, forms and important documents?',
example_text = 'For example: filling in a government form, filing medical papers, keeping documents in order.',
options_json = @pfaq_options, is_placeholder = 0 WHERE id = 16;

UPDATE questions SET prompt_text = 'Shopping alone for clothes, household necessities, or groceries.',
helper_text = 'How independently does this person shop on their own?',
example_text = 'For example: going to the supermarket, buying groceries, choosing the right items and paying for them.',
options_json = @pfaq_options, is_placeholder = 0 WHERE id = 17;

UPDATE questions SET prompt_text = 'Playing a game of skill such as bridge or chess, or working on a hobby.',
helper_text = 'How independently does this person take part in games or hobbies that need thinking or skill?',
example_text = 'For example: playing cards or chess, following the rules of the game, knitting, woodworking or gardening.',
options_json = @pfaq_options, is_placeholder = 0 WHERE id = 18;

UPDATE questions SET prompt_text = 'Heating water, making a cup of coffee or tea, and turning off the stove.',
helper_text = 'How independently does this person carry out small kitchen tasks safely?',
example_text = 'For example: boiling a kettle, making tea, and remembering to switch the stove off afterwards.',
options_json = @pfaq_options, is_placeholder = 0 WHERE id = 19;

UPDATE questions SET prompt_text = 'Preparing a balanced meal.',
helper_text = 'How independently does this person plan and cook a proper meal?',
example_text = 'For example: deciding what to cook, using several ingredients, and serving a complete meal with different food groups.',
options_json = @pfaq_options, is_placeholder = 0 WHERE id = 20;

UPDATE questions SET prompt_text = 'Keeping track of current events.',
helper_text = 'How independently does this person follow what is happening in the news, community or country?',
example_text = 'For example: discussing a news story, an election or a local event they heard or read about.',
options_json = @pfaq_options, is_placeholder = 0 WHERE id = 21;

UPDATE questions SET prompt_text = 'Paying attention to and understanding a conversation, TV, book, or magazine.',
helper_text = 'How independently does this person follow and understand what they hear, watch or read?',
example_text = 'For example: following a TV programme story or discussing a newspaper article they have just read.',
options_json = @pfaq_options, is_placeholder = 0 WHERE id = 22;

UPDATE questions SET prompt_text = 'Remembering appointments, family occasions, holidays, or medications.',
helper_text = 'How independently does this person remember important dates and things they must do or take?',
example_text = 'For example: attending a doctor appointment on the right day, taking medicine at the correct time, remembering a birthday.',
options_json = @pfaq_options, is_placeholder = 0 WHERE id = 23;

UPDATE questions SET prompt_text = 'Traveling out of the neighborhood, driving, or arranging to take buses, trains, or taxis.',
helper_text = 'How independently does this person travel to places outside their local area?',
example_text = 'For example: catching a bus to another suburb, arranging a taxi, or driving somewhere they know but outside the neighbourhood.',
options_json = @pfaq_options, is_placeholder = 0 WHERE id = 24;

SELECT id, section_id, order_index, LEFT(prompt_text,50) prompt, response_type, max_item_score, is_placeholder FROM questions WHERE section_id IN (2,3) ORDER BY section_id, order_index;
