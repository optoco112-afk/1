/*
  # Create admin user

  1. New Data
    - Add admin user to `staff` table
      - `username`: admin
      - `password`: admin123 (plain text as required by current auth system)
      - `name`: Administrator
      - `role`: admin
      - `permissions`: empty array (admin role has full access)

  2. Notes
    - This creates the initial admin user needed for system access
    - Password is stored in plain text as per current authentication implementation
    - Admin role provides full system access regardless of specific permissions
*/

INSERT INTO staff (username, password, name, role, permissions)
VALUES ('admin', 'admin123', 'Administrator', 'admin', '{}')
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions;