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