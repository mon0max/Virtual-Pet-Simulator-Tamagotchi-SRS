-- SQLite 3.37+; schema normalized to 3NF.
-- Enable foreign keys on EVERY connection, before opening a transaction.
PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE
        CHECK (length(trim(username)) > 0 AND username = trim(username)),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE TABLE Pets (
    pet_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL
        CHECK (length(name) BETWEEN 1 AND 20 AND name = trim(name)),
    color TEXT NOT NULL CHECK (color IN ('ginger', 'gray', 'white')),
    satiety INTEGER NOT NULL DEFAULT 50 CHECK (satiety BETWEEN 0 AND 100),
    hydration INTEGER NOT NULL DEFAULT 50 CHECK (hydration BETWEEN 0 AND 100),
    happiness INTEGER NOT NULL DEFAULT 50 CHECK (happiness BETWEEN 0 AND 100),
    energy INTEGER NOT NULL DEFAULT 50 CHECK (energy BETWEEN 0 AND 100),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) STRICT;

CREATE TABLE Action_Types (
    action_type_id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE
        CHECK (length(trim(code)) > 0 AND code = trim(code)),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0)
) STRICT;

CREATE TABLE Actions (
    action_id INTEGER PRIMARY KEY,
    pet_id INTEGER NOT NULL,
    action_type_id INTEGER NOT NULL,
    performed_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (pet_id) REFERENCES Pets(pet_id) ON DELETE CASCADE,
    FOREIGN KEY (action_type_id) REFERENCES Action_Types(action_type_id)
        ON DELETE RESTRICT
) STRICT;

CREATE TABLE Items (
    item_id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE
        CHECK (length(trim(code)) > 0 AND code = trim(code)),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    item_type TEXT NOT NULL CHECK (item_type IN ('food', 'toy'))
) STRICT;

-- One row per pet/item pair; quantity is the number owned by this pet.
CREATE TABLE Pet_Items (
    pet_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (pet_id, item_id),
    FOREIGN KEY (pet_id) REFERENCES Pets(pet_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE RESTRICT
) STRICT;

-- UNIQUE and composite PRIMARY KEY already create their own indexes.
CREATE INDEX idx_pets_user_id ON Pets(user_id);
CREATE INDEX idx_actions_pet_time ON Actions(pet_id, performed_at);
CREATE INDEX idx_actions_type_id ON Actions(action_type_id);
CREATE INDEX idx_pet_items_item_id ON Pet_Items(item_id);

COMMIT;
