-- Phone OTP codes table (for SMS login)
CREATE TABLE IF NOT EXISTS phone_otps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  otp text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '10 minutes',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS phone_otps_phone_idx ON phone_otps(phone);
CREATE INDEX IF NOT EXISTS phone_otps_expires_idx ON phone_otps(expires_at);

-- Add phone + password_hash columns to users table (safe: IF NOT EXISTS)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;

-- Auto-cleanup expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps() RETURNS void LANGUAGE SQL AS $$
  DELETE FROM phone_otps WHERE expires_at < now();
$$;
