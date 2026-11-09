-- Demonstration data only. Run once, after schema.sql, in an empty database.
PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

INSERT INTO Users (user_id, username, created_at) VALUES
    (1, 'demo_owner_1', '2026-11-10 09:00:00'),
    (2, 'demo_owner_2', '2026-11-10 09:05:00');

-- Pet 1: start at 50, feed +20, water +20, play +15 happiness/-10 energy.
-- Pet 2: start at 50, feed +20. Pet 3: untouched initial state.
INSERT INTO Pets (pet_id, user_id, name, color, satiety, hydration, happiness, energy, created_at) VALUES
    (1, 1, 'Мурка', 'ginger', 70, 70, 65, 40, '2026-11-10 09:10:00'),
    (2, 1, 'Барсик', 'gray', 70, 50, 50, 50, '2026-11-10 09:15:00'),
    (3, 2, 'Снежок', 'white', 50, 50, 50, 50, '2026-11-10 09:20:00');

-- Sleep/heal are planned by the original SRS; no extra game rules assigned.
INSERT INTO Action_Types (action_type_id, code, name) VALUES
    (1, 'feed', 'Кормление'),
    (2, 'water', 'Поение'),
    (3, 'play', 'Игра'),
    (4, 'sleep', 'Сон'),
    (5, 'heal', 'Лечение');

INSERT INTO Actions (action_id, pet_id, action_type_id, performed_at) VALUES
    (1, 1, 1, '2026-11-10 09:30:00'),
    (2, 1, 2, '2026-11-10 09:31:00'),
    (3, 1, 3, '2026-11-10 09:32:00'),
    (4, 2, 1, '2026-11-10 09:33:00');

INSERT INTO Items (item_id, code, name, item_type) VALUES
    (1, 'pet_food', 'Корм', 'food'),
    (2, 'ball', 'Мячик', 'toy'),
    (3, 'mouse_toy', 'Игрушечная мышь', 'toy');

-- M:N: pet 1 owns several items; item 1 belongs to several pets.
INSERT INTO Pet_Items (pet_id, item_id, quantity) VALUES
    (1, 1, 3),
    (1, 2, 1),
    (2, 1, 2),
    (3, 3, 1);

COMMIT;
