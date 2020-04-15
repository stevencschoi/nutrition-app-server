DROP TABLE IF EXISTS recipes CASCADE;
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  calories INTEGER,
  fat_in_g INTEGER,
  carbs_in_g INTEGER,
  protein_in_g INTEGER,
  sugar_in_g INTEGER,
  fiber_in_g INTEGER,
  cholesterol_in_mg INTEGER,
  sodium_in_mg INTEGER,
  image_url TEXT
);