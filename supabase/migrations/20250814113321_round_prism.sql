/*
  # Update Admin Password

  1. Changes
    - Update admin account password to "test1234"
    - Finds admin user by role and updates password
  
  2. Security
    - Updates existing admin account
    - Password stored as plain text (as per current system design)
*/

UPDATE staff 
SET password = 'test1234', updated_at = now()
WHERE role = 'admin';