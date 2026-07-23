-- Active: 1782299472968@@rsb-db-1.c1qo6kwis0dl.ap-south-1.rds.amazonaws.com@5432@postgres
DO
$$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    )
    LOOP
        EXECUTE 'TRUNCATE TABLE public.' ||
                quote_ident(r.tablename) ||
                ' CASCADE';
    END LOOP;
END
$$;
