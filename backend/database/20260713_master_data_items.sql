CREATE TABLE IF NOT EXISTS master_data_items (
  id uuid PRIMARY KEY,
  type varchar(40) NOT NULL,
  name varchar NOT NULL,
  code varchar(40) NOT NULL,
  description text,
  status varchar(20) NOT NULL DEFAULT 'ACTIVE',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT master_data_items_type_code_unique UNIQUE (type, code)
);
