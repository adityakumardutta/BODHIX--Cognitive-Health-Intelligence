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