-- ============================================================
-- APPLY VALIDATED INSTRUMENT QUESTIONS
-- Replaces placeholder question text with the approved/authorized
-- validated instrument content for AD8, RUDAS, and PFAQ.
--
-- This migration is idempotent: it only updates rows by primary
-- key and only when they are still placeholders (is_placeholder = 1).
-- Safe to run against production Supabase.
-- ============================================================

USE dementia_screen;

-- ---------------- AD8 (section_id = 1, ids 1-8) ----------------
-- AD8: Ascertain Dementia 8 (Galvin et al., Neurology 2005)
-- 8 informant-rated items, Yes(=1)/No(=0), cutoff >= 2

UPDATE questions SET
  prompt_text = 'Judgment and decision-making. Has the person shown problems with judgment — for example, making poor financial decisions, falling for scams, or having trouble with reasoning?',
  helper_text = 'This asks whether there has been a CHANGE from the person''s usual ability to make sound decisions.',
  example_text = 'For example, a person who always managed the household finances suddenly starts making unwise purchases or cannot spot a obvious scam.',
  response_type = 'YES_NO', options_json = '{"Yes":1,"No":0}', max_item_score = 1.00, is_placeholder = 0
WHERE id = 1 AND is_placeholder = 1;

UPDATE questions SET
  prompt_text = 'Interest in activities and hobbies. Does the person seem less interested in their usual hobbies, activities, or social events compared with the past?',
  helper_text = 'This asks whether there has been a CHANGE — a loss of interest in things they used to enjoy.',
  example_text = 'For example, a person who loved gardening or playing cards now shows little interest and often declines to take part.',
  response_type = 'YES_NO', options_json = '{"Yes":1,"No":0}', max_item_score = 1.00, is_placeholder = 0
WHERE id = 2 AND is_placeholder = 1;

UPDATE questions SET
  prompt_text = 'Repeating questions, stories, or statements. Does the person repeat the same questions, stories, or statements over and over?',
  helper_text = 'This asks whether there has been a CHANGE — a new pattern of repeating themselves that was not present before.',
  example_text = 'For example, asking the same question several times in an hour, or telling the same story multiple times in a day without seeming to realize it.',
  response_type = 'YES_NO', options_json = '{"Yes":1,"No":0}', max_item_score = 1.00, is_placeholder = 0
WHERE id = 3 AND is_placeholder = 1;

UPDATE questions SET
  prompt_text = 'Learning to use tools or appliances. Does the person have trouble learning how to use a new tool, appliance, or gadget — for example, a remote control, microwave, or mobile phone?',
  helper_text = 'This asks whether there has been a CHANGE — new difficulty learning to use things that are unfamiliar.',
  example_text = 'For example, a person who could previously figure out a new phone now cannot learn to use a replacement even after being shown several times.',
  response_type = 'YES_NO', options_json = '{"Yes":1,"No":0}', max_item_score = 1.00, is_placeholder = 0
WHERE id = 4 AND is_placeholder = 1;

UPDATE questions SET
  prompt_text = 'Forgetting the correct month or year. Does the person forget what month or year it is?',
  helper_text = 'This asks whether there has been a CHANGE — a new tendency to lose track of the correct date.',
  example_text = 'For example, a person who always kept track of dates now gives the wrong month or year without realizing the mistake.',
  response_type = 'YES_NO', options_json = '{"Yes":1,"No":0}', max_item_score = 1.00, is_placeholder = 0
WHERE id = 5 AND is_placeholder = 1;

UPDATE questions SET
  prompt_text = 'Handling complex financial affairs. Does the person have difficulty dealing with complicated financial matters — for example, balancing a checkbook, paying bills, or filing income taxes?',
  helper_text = 'This asks whether there has been a CHANGE — new difficulty managing finances that they used to handle.',
  example_text = 'For example, a person who always managed the household accounts now struggles to pay bills correctly or on time.',
  response_type = 'YES_NO', options_json = '{"Yes":1,"No":0}', max_item_score = 1.00, is_placeholder = 0
WHERE id = 6 AND is_placeholder = 1;

UPDATE questions SET
  prompt_text = 'Remembering appointments. Does the person have trouble remembering scheduled appointments or planned events?',
  helper_text = 'This asks whether there has been a CHANGE — a new pattern of forgetting commitments.',
  example_text = 'For example, a person who used to keep every appointment now forgets doctor visits or family gatherings they had confirmed.',
  response_type = 'YES_NO', options_json = '{"Yes":1,"No":0}', max_item_score = 1.00, is_placeholder = 0
WHERE id = 7 AND is_placeholder = 1;

UPDATE questions SET
  prompt_text = 'Consistent problems with thinking and memory. Does the person have ongoing, consistent problems with their thinking or memory?',
  helper_text = 'This asks whether there is a general, persistent CHANGE — not just an occasional slip, but a consistent pattern.',
  example_text = 'For example, family members notice that the person is clearly not as sharp as they used to be, with problems showing up most days.',
  response_type = 'YES_NO', options_json = '{"Yes":1,"No":0}', max_item_score = 1.00, is_placeholder = 0
WHERE id = 8 AND is_placeholder = 1;

-- ---------------- RUDAS (section_id = 2, ids 9-14) ----------------
-- RUDAS: Rowland Universal Dementia Assessment Scale (Storey et al. 2004)
-- 6 tasks, total 0-30, lower is concerning, cutoff <= 22

UPDATE questions SET
  prompt_text = 'I want you to imagine that we are going shopping. Here is a list of grocery items. I would like you to remember the following items which we need to get from the shop. When we get to the shop in about 5 minutes time I will ask you what it is that we have to buy. You must remember the list for me.',
  helper_text = 'Ask the person to repeat the list back to you at least three times, until they can repeat it correctly or as well as they are going to (maximum of 5 learning trials). Registration itself does not score points - the list is tested again as delayed recall at the end of the assessment.',
  example_text = 'The person repeats the four items so you can confirm the list was learned, then you continue with the other tasks before asking for the list again.',
  options_json = '{"widget":"memory","label":"Memory","items":["Tea","Cooking Oil","Eggs","Soap"],"maxTrials":5,"eachRecall":2,"promptItem":"Tea"}',
  max_item_score = 8.00, is_placeholder = 0
WHERE id = 9 AND is_placeholder = 1;



UPDATE questions SET
  prompt_text = 'I am going to ask you to identify/show me different parts of the body. (Sit opposite the test taker. Once the person correctly answers 5 parts, do not continue as the maximum score is 5. There are no half marks - each task must be 100% correct to score.)',
  helper_text = 'Score 1 for each correct response, 0 for incorrect. Remember you are sitting opposite the person - score their left/right, not yours.',
  example_text = '"Show me your right foot" - pointing to their own right foot scores 1 point.',
  options_json = '{"widget":"commands","label":"Body Orientation","each":1,"max":5,"commands":["Show me your right foot","Show me your left hand","With your right hand touch your left shoulder","With your left hand touch your right ear","Which is (point to/indicate) my left knee","Which is (point to/indicate) my right elbow","With your right hand point to/indicate my left eye","With your left hand point to/indicate my left foot"]}',
  max_item_score = 5.00, is_placeholder = 0
WHERE id = 10 AND is_placeholder = 1;

UPDATE questions SET
  prompt_text = 'Demonstrate the official fist/palm hand movement, then ask the person to copy it and continue alternating at the pace you demonstrated until you tell them to stop. The person must demonstrate the task independently when scoring (do not allow them to copy you).',
  helper_text = 'Score: Normal = good adherence to palm-down and fist actions with few intrusions, minimal errors, good fluency and self-correction. Partially adequate = obvious intrusions and incorrect variations. Failed = cannot perform the movements.',
  example_text = 'One hand in a fist in the vertical position, the other palm down, alternating hands simultaneously for 5-6 trials at a moderate walking pace.',
  options_json = '{"widget":"choice","label":"Praxis (Fist/Palm)","options":[{"label":"Normal","score":2},{"label":"Partially adequate","score":1},{"label":"Failed","score":0}]}',
  max_item_score = 2.00, is_placeholder = 0
WHERE id = 11 AND is_placeholder = 1;

UPDATE questions SET
  prompt_text = 'Ask the person to draw the shape you show them (the official RUDAS cube stimulus). Do not help, correct or comment while they draw. Score the completed drawing using the three official criteria.',
  helper_text = 'Score 1 point for each criterion present: (1) the drawing is based on a square, (2) all internal lines appear, (3) all external lines appear. Maximum 3 points.',
  example_text = 'A cube with the square base, internal lines and external lines all present scores 3/3.',
  options_json = '{"widget":"cube","label":"Drawing (Cube Copy)","criteria":["The drawing is based on a square","All internal lines appear in the drawing","All external lines appear in the drawing"],"each":1}',
  max_item_score = 3.00, is_placeholder = 0
WHERE id = 12 AND is_placeholder = 1;

UPDATE questions SET
  prompt_text = 'You are standing on the side of a busy street. There is no pedestrian crossing and no traffic lights. Tell me what you would do to get across to the other side of the street safely. (If the person gives an incomplete answer use the prompt: "Is there anything else you would do?" Record exactly what the person says.)',
  helper_text = 'Score each part separately: Did the person indicate they would look for traffic? Did they make any additional safety proposal? YES = 2, YES but only after prompting = 1, NO = 0. Maximum 4.',
  example_text = '"I would look for the cars" (2/2) plus, when prompted, "be careful" (1/2) scores 3/4.',
  options_json = '{"widget":"judgment","label":"Judgement (Crossing the Street)","areas":[{"label":"Did the person indicate that they would look for traffic?","options":[{"label":"YES","score":2},{"label":"YES PROMPTED","score":1},{"label":"NO","score":0}]},{"label":"Did the person make any additional safety proposals?","options":[{"label":"YES","score":2},{"label":"YES PROMPTED","score":1},{"label":"NO","score":0}]}],"notes":true}',
  max_item_score = 4.00, is_placeholder = 0
WHERE id = 13 AND is_placeholder = 1;

UPDATE questions SET
  prompt_text = 'I am going to time you for one minute. In that one minute, I would like you to tell me the names of as many different animals as you can. We will see how many different animals you can name in one minute. (Maximum score is 8. If the person names 8 new animals in less than one minute there is no need to continue.)',
  helper_text = 'Time for one minute only - make it clear when to start ("When I say go, you should start listing animals"). Record each different animal. Note: "big horse" and "little horse" may be recorded as two names, but only genuinely different animals score.',
  example_text = 'Cow, dog, horse, fish = four different animals. Repeating "cow" does not add a point.',
  options_json = '{"widget":"animals","label":"Language (Animal Naming)","slots":8,"seconds":60,"each":1}',
  max_item_score = 8.00, is_placeholder = 0
WHERE id = 14 AND is_placeholder = 1;

-- ---------------- PFAQ (section_id = 3, ids 15-24) ----------------
-- PFAQ: Pfeffer Functional Activities Questionnaire (Pfeffer et al. 1982)
-- 10 items, scored 0 (Normal) to 3 (Dependent), total 0-30, cutoff >= 6

SET @pfaq_options = '{"Normal":0,"Has difficulty but does by self":1,"Requires assistance":2,"Dependent":3}';

UPDATE questions SET prompt_text = 'Writing checks, paying bills, balancing a checkbook, or keeping financial records.',
  helper_text = 'How independently does this person handle their own money and financial paperwork?',
  example_text = 'For example: writing a cheque correctly, keeping the checkbook balanced, or paying the right amount on a bill.',
  options_json = @pfaq_options, is_placeholder = 0 WHERE id = 15 AND is_placeholder = 1;

UPDATE questions SET prompt_text = 'Assembling tax records, business affairs, or papers.',
  helper_text = 'How independently does this person handle paperwork, forms and important documents?',
  example_text = 'For example: filling in a government form, filing medical papers, keeping documents in order.',
  options_json = @pfaq_options, is_placeholder = 0 WHERE id = 16 AND is_placeholder = 1;

UPDATE questions SET prompt_text = 'Shopping alone for clothes, household necessities, or groceries.',
  helper_text = 'How independently does this person shop on their own?',
  example_text = 'For example: going to the supermarket, buying groceries, choosing the right items and paying for them.',
  options_json = @pfaq_options, is_placeholder = 0 WHERE id = 17 AND is_placeholder = 1;

UPDATE questions SET prompt_text = 'Playing a game of skill such as bridge or chess, or working on a hobby.',
  helper_text = 'How independently does this person take part in games or hobbies that need thinking or skill?',
  example_text = 'For example: playing cards or chess, following the rules of the game, knitting, woodworking or gardening.',
  options_json = @pfaq_options, is_placeholder = 0 WHERE id = 18 AND is_placeholder = 1;

UPDATE questions SET prompt_text = 'Heating water, making a cup of coffee or tea, and turning off the stove.',
  helper_text = 'How independently does this person carry out small kitchen tasks safely?',
  example_text = 'For example: boiling a kettle, making tea, and remembering to switch the stove off afterwards.',
  options_json = @pfaq_options, is_placeholder = 0 WHERE id = 19 AND is_placeholder = 1;

UPDATE questions SET prompt_text = 'Preparing a balanced meal.',
  helper_text = 'How independently does this person plan and cook a proper meal?',
  example_text = 'For example: deciding what to cook, using several ingredients, and serving a complete meal with different food groups.',
  options_json = @pfaq_options, is_placeholder = 0 WHERE id = 20 AND is_placeholder = 1;

UPDATE questions SET prompt_text = 'Keeping track of current events.',
  helper_text = 'How independently does this person follow what is happening in the news, community or country?',
  example_text = 'For example: discussing a news story, an election or a local event they heard or read about.',
  options_json = @pfaq_options, is_placeholder = 0 WHERE id = 21 AND is_placeholder = 1;

UPDATE questions SET prompt_text = 'Paying attention to and understanding a conversation, TV, book, or magazine.',
  helper_text = 'How independently does this person follow and understand what they hear, watch or read?',
  example_text = 'For example: following a TV programme story or discussing a newspaper article they have just read.',
  options_json = @pfaq_options, is_placeholder = 0 WHERE id = 22 AND is_placeholder = 1;

UPDATE questions SET prompt_text = 'Remembering appointments, family occasions, holidays, or medications.',
  helper_text = 'How independently does this person remember important dates and things they must do or take?',
  example_text = 'For example: attending a doctor appointment on the right day, taking medicine at the correct time, remembering a birthday.',
  options_json = @pfaq_options, is_placeholder = 0 WHERE id = 23 AND is_placeholder = 1;

UPDATE questions SET prompt_text = 'Traveling out of the neighborhood, driving, or arranging to take buses, trains, or taxis.',
  helper_text = 'How independently does this person travel to places outside their local area?',
  example_text = 'For example: catching a bus to another suburb, arranging a taxi, or driving somewhere they know but outside the neighbourhood.',
  options_json = @pfaq_options, is_placeholder = 0 WHERE id = 24 AND is_placeholder = 1;

