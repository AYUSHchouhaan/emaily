-- Make hashed_password nullable for OAuth users
ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;
