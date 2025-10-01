/*
  # Create reservations management system

  1. New Tables
    - `reservations`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `phone` (text)
      - `appointment_date` (date)
      - `appointment_time` (time)
      - `total_price` (decimal)
      - `deposit_paid` (decimal)
      - `is_paid` (boolean)
      - `design_images` (text array)
      - `notes` (text)
      - `artist_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `reservations` table
    - Add policies for authenticated staff to manage reservations
*/

CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  total_price decimal(10,2) NOT NULL,
  deposit_paid decimal(10,2) NOT NULL DEFAULT 0,
  is_paid boolean NOT NULL DEFAULT false,
  design_images text[] DEFAULT '{}',
  notes text,
  artist_id uuid REFERENCES staff(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated staff to manage reservations
CREATE POLICY "Staff can manage reservations"
  ON reservations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE id::text = auth.uid()::text 
      AND ('reservations' = ANY(permissions) OR role = 'admin')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reservations_appointment_date ON reservations(appointment_date);
CREATE INDEX IF NOT EXISTS idx_reservations_artist_id ON reservations(artist_id);
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);