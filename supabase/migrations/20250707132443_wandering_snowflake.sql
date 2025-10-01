/*
  # Create Admin User

  1. New Data
    - Add default admin user to `staff` table
      - username: 'admin'
      - password: 'admin123'
      - name: 'Administrator'
      - role: 'admin'
      - permissions: all permissions

  2. Security
    - Admin user will have full access to all features
    - Password should be changed after first login in production

  Note: This creates a default admin account for initial system access.
  In production, the password should be changed immediately after first login.
*/

INSERT INTO staff (
  name,
  username,
  password,
  role,
  permissions
) VALUES (
  'Administrator',
  'admin',
  'admin123',
  'admin',
  ARRAY['reservations', 'staff_management', 'reports']
) ON CONFLICT (username) DO NOTHING;