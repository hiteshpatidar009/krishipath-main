const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    host: process.env._DB_HOST_ONE || process.env.DB_HOST_ONE || 'localhost',
    port: process.env._DB_PORT_ONE || process.env.DB_PORT_ONE || 5432,
    user: process.env._DB_USER_ONE || process.env.DB_USER_ONE || 'postgres',
    password: process.env._DB_PASSWORD_ONE || process.env.DB_PASSWORD_ONE || 'postgres',
    database: process.env._DB_NAME_ONE || process.env.DB_NAME_ONE || 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to DB1");

    await client.query(`
      CREATE TABLE IF NOT EXISTS content_schemes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar NOT NULL,
        description text,
        category varchar,
        state varchar,
        link varchar,
        image_url varchar,
        status varchar NOT NULL DEFAULT 'ACTIVE',
        expires_at timestamp,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      );
      
      CREATE TABLE IF NOT EXISTS content_predictions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        crop_id uuid NOT NULL,
        mandi_id uuid,
        predicted_price numeric NOT NULL,
        direction varchar NOT NULL,
        period varchar NOT NULL,
        confidence integer NOT NULL,
        notes text,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS content_polls (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        question varchar NOT NULL,
        region varchar,
        is_active boolean NOT NULL DEFAULT true,
        total_votes integer NOT NULL DEFAULT 0,
        created_at timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS content_poll_options (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        poll_id uuid NOT NULL,
        text varchar NOT NULL,
        votes integer NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS content_creators (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar NOT NULL,
        bio text,
        avatar_url varchar,
        specialty varchar,
        followers_k numeric NOT NULL DEFAULT '0',
        status varchar NOT NULL DEFAULT 'ACTIVE',
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS content_shorts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar NOT NULL,
        video_url varchar NOT NULL,
        thumbnail_url varchar,
        creator_id uuid,
        views integer NOT NULL DEFAULT 0,
        likes integer NOT NULL DEFAULT 0,
        language varchar DEFAULT 'hi',
        status varchar NOT NULL DEFAULT 'ACTIVE',
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      );
    `);
    console.log("Tables created successfully");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    await client.end();
  }
}

run();
