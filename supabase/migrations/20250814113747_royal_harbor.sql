/*
  # Update Admin Password

  1. Changes
    - Updates admin user password to 'test1234'
    - Updates the updated_at timestamp
    - Targets user with role 'admin'

  2. Security
    - Direct password update for admin access
*/

-- Update admin password to test1234
UPDATE staff 
SET 
  password = 'test1234',
  updated_at = now()
WHERE role = 'admin';

-- Verify the update
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM staff WHERE role = 'admin' AND password = 'test1234') THEN
    RAISE NOTICE 'Admin password successfully updated to test1234';
  ELSE
    RAISE NOTICE 'Admin password update failed or no admin user found';
  END IF;
END $$;