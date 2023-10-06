# Drop the existing database
docker exec -it mixtape_postgres_1 psql -U postgres -c "DROP DATABASE IF EXISTS mixtape_dev;"

# Create a new database
docker exec -it mixtape_postgres_1 psql -U postgres -c "CREATE DATABASE mixtape_dev;"

# Copy the file to backup.sql
docker cp ./scripts/backup-dev-db-23-10-06.sql mixtape_postgres_1:/backup.sql

# Restore the database from the backup
docker exec -it mixtape_postgres_1 psql -U postgres -d mixtape_dev -f /backup.sql
