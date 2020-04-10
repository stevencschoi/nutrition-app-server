DROP TABLE IF EXISTS recipes CASCADE;
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  ingredients TEXT[] NOT NULL,
  prep_time_in_minutes INTEGER,
  calories INTEGER,
  saturated_fat_in_g INTEGER,
  carbs_in_g INTEGER,
  sugar_in_g INTEGER,
  sodium_in_mg INTEGER,
  cholesterol_in_mg INTEGER,
  protein_in_g INTEGER,
  fiber_in_g INTEGER,
  iron_in_mg INTEGER,
  vitamin_c_in_mg INTEGER,
  calcium_in_mg INTEGER
);