DROP TABLE IF EXISTS following CASCADE;
CREATE TABLE following (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  follow_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, follow_id)
);