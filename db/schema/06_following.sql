DROP TABLE IF EXISTS following CASCADE;
CREATE TABLE following (
  user_id INTEGER REFERENCES users(id),
  follow_id INTEGER REFERENCES users(id),
  UNIQUE (user_id, follow_id)
);