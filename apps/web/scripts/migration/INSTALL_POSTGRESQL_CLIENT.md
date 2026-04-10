# 📦 How to Install PostgreSQL Client

The migration scripts require PostgreSQL client tools (`psql` and `pg_dump`). Here's how to install them on different operating systems.

---

## 🐧 Linux (Ubuntu/Debian)

### Method 1: Using apt (Recommended)

```bash
sudo apt-get update
sudo apt-get install postgresql-client
```

### Method 2: Install specific version

```bash
# For PostgreSQL 15
sudo apt-get install postgresql-client-15

# For PostgreSQL 14
sudo apt-get install postgresql-client-14
```

### Verify Installation

```bash
psql --version
pg_dump --version
```

---

## 🍎 macOS

### Method 1: Using Homebrew (Recommended)

```bash
brew install postgresql
```

### Method 2: Using MacPorts

```bash
sudo port install postgresql15
```

### Verify Installation

```bash
psql --version
pg_dump --version
```

---

## 🪟 Windows

### Method 1: Using Chocolatey

```bash
choco install postgresql
```

### Method 2: Using Scoop

```bash
scoop install postgresql
```

### Method 3: Direct Download

1. Go to https://www.postgresql.org/download/windows/
2. Download the PostgreSQL installer
3. During installation, select "Command Line Tools" or "psql"
4. Add PostgreSQL bin directory to your PATH:
   - Usually: `C:\Program Files\PostgreSQL\15\bin`
   - Add to System Environment Variables → Path

### Verify Installation

Open PowerShell or Command Prompt:

```powershell
psql --version
pg_dump --version
```

---

## 🐳 Docker (Alternative)

If you don't want to install PostgreSQL locally, you can use Docker:

```bash
# Run psql/pg_dump via Docker
docker run --rm -it postgres:15 psql --version
docker run --rm -it postgres:15 pg_dump --version
```

For actual usage with migration scripts, you'd need to modify the scripts to use Docker, or use this approach:

```bash
# Export database using Docker
docker run --rm -e PGPASSWORD=your_password postgres:15 \
  pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres \
  > exports/full_database_export.sql
```

---

## ✅ Verify Installation

After installation, verify both tools are available:

```bash
# Check psql version
psql --version
# Should output: psql (PostgreSQL) 15.x or similar

# Check pg_dump version
pg_dump --version
# Should output: pg_dump (PostgreSQL) 15.x or similar

# Test connection (optional)
psql -h db.xxxxx.supabase.co -U postgres -d postgres -c "SELECT version();"
```

---

## 🔧 Troubleshooting

### "Command not found" after installation

**Linux/macOS:**
- Make sure PostgreSQL bin directory is in your PATH
- Try: `export PATH="/usr/bin:$PATH"` or add to `~/.bashrc`/`~/.zshrc`

**Windows:**
- Add PostgreSQL bin to System Environment Variables
- Restart terminal/PowerShell after adding to PATH

### Permission denied

**Linux:**
- Make sure you have execute permissions: `chmod +x /usr/bin/psql`
- Or use `sudo` if needed

### Connection refused

- Check that you're using the correct HOST
- Verify your IP is allowed in Supabase (Settings → Database → Connection pooling)
- Try connecting manually first: `psql -h [HOST] -U postgres -d postgres`

---

## 📝 Quick Test

Once installed, test with a simple connection:

```bash
# Replace with your Supabase credentials
psql -h db.xxxxx.supabase.co -U postgres -d postgres -c "SELECT 1;"
```

If this works, you're ready to use the migration scripts! 🎉

---

## 🚀 Next Steps

After installing PostgreSQL client:

1. Verify installation (see above)
2. Go to migration scripts directory: `cd scripts/migration`
3. Make scripts executable: `chmod +x *.sh`
4. Run migration: `./00_full_migration.sh`

---

## 📚 Additional Resources

- [PostgreSQL Downloads](https://www.postgresql.org/download/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [psql Documentation](https://www.postgresql.org/docs/current/app-psql.html)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)

