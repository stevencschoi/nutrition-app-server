DROP TABLE IF EXISTS ingredients CASCADE;
CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  calories INTEGER,
  fat_in_g INTEGER,
  carbs_in_g INTEGER,
  sugar_in_g INTEGER,
  sodium_in_mg INTEGER,
  cholesterol_in_mg INTEGER,
  protein_in_g INTEGER,
  fiber_in_g INTEGER,
  iron_in_mg INTEGER,
  vitamin_c_in_mg INTEGER,
  calcium_in_mg INTEGER,
  image_url TEXT
);