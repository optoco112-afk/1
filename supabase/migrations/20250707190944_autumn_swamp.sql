/*
  # Update staff permissions to include economics

  1. Changes
    - Add 'economics' permission to admin users
    - Update existing admin users to have economics access

  2. Notes
    - This ensures admin users can access the new economics dashboard
    - Staff and artist roles can be granted economics permission as needed
*/

-- Update admin users to include economics permission
UPDATE staff 
SET permissions = array_append(permissions, 'economics')
WHERE role = 'admin' 
AND NOT ('economics' = ANY(permissions));

-- Update the default admin user specifically
UPDATE staff 
SET permissions = ARRAY['reservations', 'staff', 'economics']
WHERE username = 'admin' AND role = 'admin';