# 🔧 Troubleshooting Migration Scripts

## Common Connection Issues

### ❌ Error: "Network is unreachable" or IPv6 connection fails

**Problem:** The script is trying to connect via IPv6, but your network/WSL2 doesn't support it.

**Solutions:**

#### Solution 1: Use Connection Pooling Port (Recommended)

Supabase uses connection pooling. Try using port **6543** instead of **5432**:

```bash
# When prompted for PORT, enter: 6543
```

#### Solution 2: Force IPv4 (Already in script)

The script now includes `-4` flag to force IPv4. If it still fails, try:

```bash
# Test connection manually first
psql -4 -h db.xxxxx.supabase.co -U postgres -d postgres -p 5432
```

#### Solution 3: Use Connection String Format

Instead of separate HOST/PORT, use connection string:

```bash
# Get connection string from Supabase Dashboard
# Settings → Database → Connection string → URI
# Format: postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Then use:
pg_dump "postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres" \
  --no-owner --no-privileges --clean -f exports/full_export.sql
```

#### Solution 4: Check Supabase IP Restrictions

1. Go to Supabase Dashboard → Settings → Database
2. Check **Connection pooling** settings
3. Make sure your IP is allowed (or disable IP restrictions temporarily)
4. Try using **Connection Pooling** mode (port 6543)

---

### ❌ Error: "Connection refused"

**Possible causes:**
- Wrong HOST or PORT
- IP not whitelisted in Supabase
- Firewall blocking connection

**Solutions:**

1. **Verify HOST format:**
   - Should be: `db.xxxxx.supabase.co`
   - NOT: `https://db.xxxxx.supabase.co` (no https://)
   - NOT: `xxxxx.supabase.co` (missing db. prefix)

2. **Check Supabase Settings:**
   - Go to Settings → Database → Connection pooling
   - Check if IP restrictions are enabled
   - Temporarily disable or add your IP

3. **Try different ports:**
   - Direct connection: `5432`
   - Connection pooling: `6543`
   - Transaction mode: `6543` (with `?pgbouncer=true`)

---

### ❌ Error: "Password authentication failed"

**Solutions:**

1. **Reset database password:**
   - Go to Supabase Dashboard → Settings → Database
   - Click "Reset database password"
   - Copy the new password immediately (you won't see it again!)

2. **Verify password:**
   - Make sure no extra spaces when pasting
   - Check if password is URL-encoded (special characters)

---

### ❌ Error: "pg_dump: command not found"

**Solution:** Install PostgreSQL client:

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# See INSTALL_POSTGRESQL_CLIENT.md for details
```

---

### ❌ Error: "jq: command not found"

**Solution:** Install jq:

```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

---

## WSL2 Specific Issues

### IPv6 Not Working

WSL2 sometimes has IPv6 issues. The script now forces IPv4 with `-4` flag.

If still failing:

```bash
# Disable IPv6 in WSL2 (temporary)
sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1
```

### Network Connectivity

Test basic connectivity:

```bash
# Test DNS resolution
nslookup db.xxxxx.supabase.co

# Test connection
telnet db.xxxxx.supabase.co 5432
# Or
nc -zv db.xxxxx.supabase.co 5432
```

---

## Alternative: Use Supabase Dashboard Export

If command-line export keeps failing, you can export via Supabase Dashboard:

1. Go to Supabase Dashboard → Database → Backups
2. Click "Create backup" or "Download backup"
3. Use the downloaded SQL file instead

Then skip step 1 (export) and go directly to step 2 (import).

---

## Getting Help

If none of these solutions work:

1. **Check Supabase Status:** https://status.supabase.com
2. **Check your network:** Try from a different network/VPN
3. **Use Supabase Dashboard:** Export via web interface instead
4. **Check logs:** Look at Supabase Dashboard → Logs for connection attempts

---

## Quick Test Connection

Before running full migration, test connection:

```bash
# Test with psql
psql -4 -h db.xxxxx.supabase.co -U postgres -d postgres -p 5432 -c "SELECT version();"

# If that works, try pg_dump
PGPASSWORD=your_password pg_dump -4 -h db.xxxxx.supabase.co -U postgres -d postgres -p 5432 --schema-only > test_export.sql
```

If these work, the migration script should work too!

