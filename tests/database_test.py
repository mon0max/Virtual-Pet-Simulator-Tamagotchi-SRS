"""Validate the proposed SQLite model without touching persistent user data."""
from pathlib import Path
import sqlite3
import unittest

ROOT = Path(__file__).resolve().parents[1]

class DatabaseTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        self.addCleanup(self.db.close)
        self.db.executescript((ROOT / 'database/schema.sql').read_text(encoding='utf-8-sig'))
        self.db.executescript((ROOT / 'database/seed_data.sql').read_text(encoding='utf-8-sig'))

    def scalar(self, sql, args=()):
        return self.db.execute(sql, args).fetchone()[0]

    def test_schema_and_seed_integrity(self):
        self.assertEqual(self.scalar('PRAGMA foreign_keys'), 1)
        self.assertEqual(self.db.execute('PRAGMA foreign_key_check').fetchall(), [])
        self.assertEqual(self.scalar('PRAGMA integrity_check'), 'ok')
        expected = {'Users':2, 'Pets':3, 'Action_Types':5, 'Actions':4, 'Items':3, 'Pet_Items':4}
        for table, count in expected.items():
            self.assertEqual(self.scalar(f'SELECT count(*) FROM {table}'), count)

    def test_many_to_many_and_history_queries(self):
        rows = self.db.execute('SELECT i.code, pi.quantity FROM Pet_Items pi JOIN Items i USING (item_id) WHERE pet_id=1 ORDER BY i.code').fetchall()
        self.assertEqual(rows, [('ball',1), ('pet_food',3)])
        self.assertEqual(self.scalar('SELECT count(DISTINCT pet_id) FROM Pet_Items WHERE item_id=1'), 2)
        self.assertEqual(self.db.execute('SELECT t.code FROM Actions a JOIN Action_Types t USING (action_type_id) WHERE pet_id=1 ORDER BY performed_at').fetchall(), [('feed',),('water',),('play',)])

    def test_defaults_and_name_boundaries(self):
        self.db.execute("INSERT INTO Pets (user_id,name,color) VALUES (1, ?, 'white')", ('x'*20,))
        row = self.db.execute('SELECT satiety,hydration,happiness,energy FROM Pets WHERE pet_id=4').fetchone()
        self.assertEqual(row, (50,50,50,50))
        for name in ['', ' ', 'x'*21, ' Кот']:
            with self.subTest(name=name), self.assertRaises(sqlite3.IntegrityError):
                self.db.execute("INSERT INTO Pets (user_id,name,color) VALUES (1, ?, 'white')", (name,))

    def test_constraints_reject_invalid_data(self):
        statements = [
            "INSERT INTO Users (username) VALUES ('demo_owner_1')",
            "INSERT INTO Users (username) VALUES ('   ')",
            "INSERT INTO Pets (user_id,name,color) VALUES (999,'Кот','gray')",
            "INSERT INTO Pets (user_id,name,color) VALUES (NULL,'Кот','gray')",
            "UPDATE Pets SET energy=-1 WHERE pet_id=1",
            "UPDATE Pets SET satiety=101 WHERE pet_id=1",
            "UPDATE Pets SET hydration=NULL WHERE pet_id=1",
            "UPDATE Pets SET happiness=50.5 WHERE pet_id=1",
            "UPDATE Pets SET color='purple' WHERE pet_id=1",
            "INSERT INTO Pet_Items VALUES (1,1,1)",
            "INSERT INTO Pet_Items VALUES (1,3,0)",
            "INSERT INTO Pet_Items VALUES (1,3,1.5)",
            "INSERT INTO Pet_Items VALUES (1,999,1)",
            "INSERT INTO Actions (pet_id,action_type_id) VALUES (1,999)",
            "INSERT INTO Action_Types (code,name) VALUES ('feed','Дубликат')",
            "INSERT INTO Items (code,name,item_type) VALUES ('bad','Товар','invalid')",
        ]
        for sql in statements:
            with self.subTest(sql=sql), self.assertRaises(sqlite3.IntegrityError):
                self.db.execute(sql)

    def test_cascade_preserves_other_owner_and_catalogs(self):
        self.db.execute('DELETE FROM Users WHERE user_id=1')
        self.assertEqual(self.db.execute('SELECT pet_id FROM Pets').fetchall(), [(3,)])
        self.assertEqual(self.scalar('SELECT count(*) FROM Actions'), 0)
        self.assertEqual(self.db.execute('SELECT pet_id,item_id FROM Pet_Items').fetchall(), [(3,3)])
        self.assertEqual(self.scalar('SELECT count(*) FROM Items'), 3)
        self.assertEqual(self.scalar('SELECT count(*) FROM Action_Types'), 5)
        self.assertEqual(self.db.execute('PRAGMA foreign_key_check').fetchall(), [])

    def test_catalog_deletion_is_restricted_if_referenced(self):
        for sql in ['DELETE FROM Items WHERE item_id=1', 'DELETE FROM Action_Types WHERE action_type_id=1']:
            with self.subTest(sql=sql), self.assertRaises(sqlite3.IntegrityError):
                self.db.execute(sql)
        self.db.execute('DELETE FROM Action_Types WHERE action_type_id=5')
        self.assertEqual(self.scalar('SELECT count(*) FROM Action_Types'), 4)

    def test_indexes_cover_foreign_keys_and_history(self):
        names = {row[0] for row in self.db.execute("SELECT name FROM sqlite_schema WHERE type='index'")}
        self.assertTrue({'idx_pets_user_id','idx_actions_pet_time','idx_actions_type_id','idx_pet_items_item_id'} <= names)
        self.assertEqual([r[2] for r in self.db.execute('PRAGMA index_info(idx_actions_pet_time)')], ['pet_id','performed_at'])

if __name__ == '__main__':
    unittest.main(verbosity=2)
