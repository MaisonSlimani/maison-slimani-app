# VAPID Keys for Push Notifications

## Generated Keys

**Public Key:**
```
BDbmkMaed9PtIPUbiP5Ga0MkvGkgNTxjA7CbAagKkRBgO32J9mPkLkOn3yktmX48w7oYrPqdtwW2q2nJqJ-h8jE
```

**Private Key:**
```
dDOMp33LAbQp7HRLLnDGvHngntupyXknv27MsMGlAAg
```

## Setup Instructions

### 1. Admin App Environment Variables

Add to `admin-app/.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BDbmkMaed9PtIPUbiP5Ga0MkvGkgNTxjA7CbAagKkRBgO32J9mPkLkOn3yktmX48w7oYrPqdtwW2q2nJqJ-h8jE
```

### 2. Supabase Edge Function Secrets

Set these in Supabase Dashboard → Edge Functions → Settings, or via CLI:

```bash
supabase functions secrets set VAPID_PUBLIC_KEY=BDbmkMaed9PtIPUbiP5Ga0MkvGkgNTxjA7CbAagKkRBgO32J9mPkLkOn3yktmX48w7oYrPqdtwW2q2nJqJ-h8jE
supabase functions secrets set VAPID_PRIVATE_KEY=dDOMp33LAbQp7HRLLnDGvHngntupyXknv27MsMGlAAg
```

**Important:** Keep the private key secure and never expose it in client-side code.

