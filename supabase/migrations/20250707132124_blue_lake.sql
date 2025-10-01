/*
  # Create staff management system

  1. New Tables
    - `staff`
      - `id` (uuid, primary key)
      - `name` (text)
      - `username` (text, unique)
      - `password` (text)
      - `role` (text)
      - `permissions` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `staff` table
    - Add policies for authenticated staff to manage other staff (admin only)
    - Add policy for staff to read their own data
*/

CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'staff', 'artist')),
  permissions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Policy for staff to read their own data
CREATE POLICY "Staff can read own data"
  ON staff
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Policy for admins to manage all staff
CREATE POLICY "Admins can manage all staff"
  ON staff
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Insert default admin user
INSERT INTO staff (name, username, password, role, permissions) 
VALUES (
  'Admin User',
  'admin',
  'admin123',
  'admin',
  ARRAY['reservations', 'staff', 'settings']
) ON CONFLICT (username) DO NOTHING;