-- RUDAS official content (RUDAS Administration & Scoring Guide, NSW Health / Dementia Australia; Storey et al. 2004).
-- 6 items, ids 9-14, section 2. Maxima: Memory 8 | Body 5 | Praxis 2 | Drawing 3 | Judgment 4 | Language 8 = 30.
-- Scoring stays numeric (TASK_SCORE); options_json carries UI metadata (widget/label/items/options).

UPDATE questions SET
prompt_text = 'I want you to imagine that we are going shopping. Here is a list of grocery items. I would like you to remember the following items which we need to get from the shop. When we get to the shop in about 5 minutes time I will ask you what it is that we have to buy. You must remember the list for me.',
helper_text = 'Ask the person to repeat the list back to you at least three times, until they can repeat it correctly or as well as they are going to (maximum of 5 learning trials). Registration itself does not score points - the list is tested again as delayed recall at the end of the assessment.',
example_text = 'The person repeats the four items so you can confirm the list was learned, then you continue with the other tasks before asking for the list again.',
options_json = '{"widget":"memory","label":"Memory","items":["Tea","Cooking Oil","Eggs","Soap"],"maxTrials":5,"eachRecall":2,"promptItem":"Tea"}',
max_item_score = 8.00, is_placeholder = 0 WHERE id = 9;

UPDATE questions SET
prompt_text = 'I am going to ask you to identify/show me different parts of the body. (Sit opposite the test taker. Once the person correctly answers 5 parts, do not continue as the maximum score is 5. There are no half marks - each task must be 100% correct to score.)',
helper_text = 'Score 1 for each correct response, 0 for incorrect. Remember you are sitting opposite the person - score their left/right, not yours.',
example_text = '"Show me your right foot" - pointing to their own right foot scores 1 point.',
options_json = '{"widget":"commands","label":"Body Orientation","each":1,"max":5,"commands":["Show me your right foot","Show me your left hand","With your right hand touch your left shoulder","With your left hand touch your right ear","Which is (point to/indicate) my left knee","Which is (point to/indicate) my right elbow","With your right hand point to/indicate my left eye","With your left hand point to/indicate my left foot"]}',
max_item_score = 5.00, is_placeholder = 0 WHERE id = 10;

UPDATE questions SET
prompt_text = 'Demonstrate the official fist/palm hand movement, then ask the person to copy it and continue alternating at the pace you demonstrated until you tell them to stop. The person must demonstrate the task independently when scoring (do not allow them to copy you).',
helper_text = 'Score: Normal = good adherence to palm-down and fist actions with few intrusions, minimal errors, good fluency and self-correction. Partially adequate = obvious intrusions and incorrect variations. Failed = cannot perform the movements.',
example_text = 'One hand in a fist in the vertical position, the other palm down, alternating hands simultaneously for 5-6 trials at a moderate walking pace.',
options_json = '{"widget":"choice","label":"Praxis (Fist/Palm)","options":[{"label":"Normal","score":2},{"label":"Partially adequate","score":1},{"label":"Failed","score":0}]}',
max_item_score = 2.00, is_placeholder = 0 WHERE id = 11;

UPDATE questions SET
prompt_text = 'Ask the person to draw the shape you show them (the official RUDAS cube stimulus). Do not help, correct or comment while they draw. Score the completed drawing using the three official criteria.',
helper_text = 'Score 1 point for each criterion present: (1) the drawing is based on a square, (2) all internal lines appear, (3) all external lines appear. Maximum 3 points.',
example_text = 'A cube with the square base, internal lines and external lines all present scores 3/3.',
options_json = '{"widget":"cube","label":"Drawing (Cube Copy)","criteria":["The drawing is based on a square","All internal lines appear in the drawing","All external lines appear in the drawing"],"each":1}',
max_item_score = 3.00, is_placeholder = 0 WHERE id = 12;

UPDATE questions SET
prompt_text = 'You are standing on the side of a busy street. There is no pedestrian crossing and no traffic lights. Tell me what you would do to get across to the other side of the street safely. (If the person gives an incomplete answer use the prompt: "Is there anything else you would do?" Record exactly what the person says.)',
helper_text = 'Score each part separately: Did the person indicate they would look for traffic? Did they make any additional safety proposal? YES = 2, YES but only after prompting = 1, NO = 0. Maximum 4.',
example_text = '"I would look for the cars" (2/2) plus, when prompted, "be careful" (1/2) scores 3/4.',
options_json = '{"widget":"judgment","label":"Judgement (Crossing the Street)","areas":[{"label":"Did the person indicate that they would look for traffic?","options":[{"label":"YES","score":2},{"label":"YES PROMPTED","score":1},{"label":"NO","score":0}]},{"label":"Did the person make any additional safety proposals?","options":[{"label":"YES","score":2},{"label":"YES PROMPTED","score":1},{"label":"NO","score":0}]}],"notes":true}',
max_item_score = 4.00, is_placeholder = 0 WHERE id = 13;

UPDATE questions SET
prompt_text = 'I am going to time you for one minute. In that one minute, I would like you to tell me the names of as many different animals as you can. We will see how many different animals you can name in one minute. (Maximum score is 8. If the person names 8 new animals in less than one minute there is no need to continue.)',
helper_text = 'Time for one minute only - make it clear when to start ("When I say go, you should start listing animals"). Record each different animal. Note: "big horse" and "little horse" may be recorded as two names, but only genuinely different animals score.',
example_text = 'Cow, dog, horse, fish = four different animals. Repeating "cow" does not add a point.',
options_json = '{"widget":"animals","label":"Language (Animal Naming)","slots":8,"seconds":60,"each":1}',
max_item_score = 8.00, is_placeholder = 0 WHERE id = 14;