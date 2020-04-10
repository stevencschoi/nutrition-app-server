DROP TABLE IF EXISTS following CASCADE;
CREATE TABLE following (
  user_id INTEGER REFERENCES users(id)
  following_id INTEGER REFERENCES users(id)
);