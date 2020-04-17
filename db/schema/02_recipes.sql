DROP TABLE IF EXISTS recipes CASCADE;
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  calories NUMERIC(6,2),
  fat_in_g NUMERIC(6,2),
  carbs_in_g NUMERIC(6,2),
  protein_in_g NUMERIC(6,2),
  sugar_in_g NUMERIC(6,2),
  fiber_in_g NUMERIC(6,2),
  cholesterol_in_mg NUMERIC(6,2),
  sodium_in_mg NUMERIC(6,2),
  image_url TEXT
);