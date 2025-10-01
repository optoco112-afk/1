/*
  # Add reservation number and payment status tracking

  1. Schema Changes
    - Add `reservation_number` column to reservations table
    - Add `deposit_paid_status` column to track deposit payment separately
    - Add `rest_paid_status` column to track remaining payment
    - Create index for reservation number lookups
    - Set starting reservation number to 1290

  2. Data Migration
    - Update existing reservations with sequential numbers starting from 1290
    - Set default payment status based on existing data
*/

-- Add new columns to reservations table
DO $$
BEGIN
  -- Add reservation_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations' AND column_name = 'reservation_number'
  ) THEN
    ALTER TABLE reservations ADD COLUMN reservation_number integer;
  END IF;

  -- Add deposit_paid_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations' AND column_name = 'deposit_paid_status'
  ) THEN
    ALTER TABLE reservations ADD COLUMN deposit_paid_status boolean DEFAULT false;
  END IF;

  -- Add rest_paid_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations' AND column_name = 'rest_paid_status'
  ) THEN
    ALTER TABLE reservations ADD COLUMN rest_paid_status boolean DEFAULT false;
  END IF;
END $$;

-- Update existing reservations with sequential reservation numbers starting from 1290
DO $$
DECLARE
  rec RECORD;
  counter INTEGER := 1290;
BEGIN
  FOR rec IN 
    SELECT id FROM reservations 
    WHERE reservation_number IS NULL 
    ORDER BY created_at ASC
  LOOP
    UPDATE reservations 
    SET reservation_number = counter 
    WHERE id = rec.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Set default payment statuses based on existing data
UPDATE reservations 
SET 
  deposit_paid_status = (deposit_paid > 0),
  rest_paid_status = is_paid
WHERE deposit_paid_status IS NULL OR rest_paid_status IS NULL;

-- Make reservation_number NOT NULL and unique after setting values
ALTER TABLE reservations ALTER COLUMN reservation_number SET NOT NULL;
ALTER TABLE reservations ADD CONSTRAINT reservations_reservation_number_unique UNIQUE (reservation_number);

-- Create index for reservation number lookups
CREATE INDEX IF NOT EXISTS idx_reservations_reservation_number ON reservations(reservation_number);