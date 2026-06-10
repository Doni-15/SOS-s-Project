-- Active: 1780687939901@@acela.proxy.rlwy.net@40921@railway
SELECT current_database(), current_user, current_schema();

SHOW search_path;


SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;
