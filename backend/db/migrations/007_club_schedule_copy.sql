-- Correct the club-news article that stated the previous weekly Zoom schedule as current.
-- Only the sentence with the old Sunday-evening block is replaced. Other articles are untouched.

UPDATE articles
SET
  body = replace(
    body,
    'Четыре регулярные Zoom-практики в неделю, включая воскресный вечерний блок.',
    'Четыре регулярные Zoom-практики в неделю: воскресенье 09:30–11:00 (ведёт Женя), йога-зарядка в понедельник 08:00–08:30 (ведёт Тим), среда 20:00–21:00 (ведёт Женя) и пятница 20:00–21:00 (ведёт Женя).'
  ),
  updated_at = NOW()
WHERE body LIKE '%включая воскресный вечерний блок%';
