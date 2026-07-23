DO $$
DECLARE
  canonical_mandi_id uuid := '2a775b93-5db8-44d7-91a5-6eba579b3297';
  duplicate_mandi_ids uuid[] := ARRAY[
    '32bf9854-a950-4370-ac64-8c73766c2df3'::uuid,
    '3dd02d18-2fc6-422a-a6ba-522ad3304635'::uuid
  ];
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM mandis
    WHERE id = canonical_mandi_id
      AND lower(trim(name)) = 'ujjain'
  ) THEN
    RAISE NOTICE 'Canonical Ujjain mandi is not present; consolidation skipped';
    RETURN;
  END IF;

  UPDATE farmers f
  SET preferred_mandi_id = canonical_mandi_id,
      updated_at = now()
  WHERE f.preferred_mandi_id = ANY(duplicate_mandi_ids)
    AND NOT EXISTS (
      SELECT 1 FROM official_mandi_prices p
      WHERE p.mandi_id = f.preferred_mandi_id
    )
    AND NOT EXISTS (
      SELECT 1 FROM mandi_trader_assignments a
      WHERE a.mandi_id = f.preferred_mandi_id AND a.status = 'ACTIVE'
    );

  UPDATE farmer_mandis fm
  SET mandi_id = canonical_mandi_id
  WHERE fm.mandi_id = ANY(duplicate_mandi_ids)
    AND NOT EXISTS (
      SELECT 1 FROM official_mandi_prices p
      WHERE p.mandi_id = fm.mandi_id
    )
    AND NOT EXISTS (
      SELECT 1 FROM mandi_trader_assignments a
      WHERE a.mandi_id = fm.mandi_id AND a.status = 'ACTIVE'
    );

  UPDATE mandis m
  SET status = 'INACTIVE',
      updated_at = now()
  WHERE m.id = ANY(duplicate_mandi_ids)
    AND lower(trim(m.name)) = 'ujjain'
    AND NOT EXISTS (SELECT 1 FROM official_mandi_prices p WHERE p.mandi_id = m.id)
    AND NOT EXISTS (SELECT 1 FROM mandi_trader_assignments a WHERE a.mandi_id = m.id AND a.status = 'ACTIVE')
    AND NOT EXISTS (SELECT 1 FROM traders t WHERE t.primary_mandi_id = m.id)
    AND NOT EXISTS (SELECT 1 FROM farmers f WHERE f.preferred_mandi_id = m.id);
END $$;
