# Easy Admin Account Creation Guide

## 🎯 Quickest Method: Supabase SQL Editor

### Step 1: Get Your Password Hash

**Option A: Online Tool (Easiest)**
1. Go to https://bcrypt-generator.com/
2. Enter your password
3. Set rounds to **12**
4. Click "Generate Hash"
5. Copy the hash (starts with `$2b$12$...`)

**Option B: Node.js (If you have Node installed)**
```bash
node -e "const bcrypt=require('bcrypt');bcrypt.hash('YOUR_PASSWORD',12).then(h=>console.log(h))"
```

### Step 2: Run SQL in Supabase

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste this SQL:

```sql
INSERT INTO admins (email, hash_mdp, role)
VALUES (
  'your-email@example.com',  -- ⬅️ Replace with your email
  '$2b$12$YOUR_HASH_HERE',    -- ⬅️ Replace with hash from Step 1
  'super-admin'
)
ON CONFLICT (email) 
DO UPDATE SET 
  hash_mdp = EXCLUDED.hash_mdp,
  role = EXCLUDED.role;
```

3. Replace the email and hash
4. Click **Run**

### Step 3: Verify

```sql
SELECT email, role, created_at 
FROM admins 
WHERE email = 'your-email@example.com';
```

---

## 📝 Alternative: One-Line Command (If you have the script)

```bash
# From project root
npm run create-admin
# OR
node scripts/create-admin.js
```

---

## 🔒 Security Notes

- Never commit password hashes to Git
- Use strong passwords (min 8 characters)
- The `ON CONFLICT` clause will update password if admin already exists
- All admins get `super-admin` role by default

---

## 🆘 Troubleshooting

**"Email already exists"** → The SQL will update the password automatically

**"Invalid hash"** → Make sure you're using bcrypt with 12 rounds

**"Permission denied"** → Make sure you're using the Service Role key or have proper RLS policies

