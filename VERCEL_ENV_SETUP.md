# Configuration des variables d'environnement sur Vercel

## Problème

Si vous voyez l'erreur :
```
@supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

Cela signifie que les variables d'environnement Supabase ne sont pas configurées dans Vercel.

## Solution

### 1. Récupérer vos clés Supabase

1. Allez sur votre projet Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Copiez les valeurs suivantes :
   - **Project URL** (URL du projet)
   - **anon/public key** (Clé publique anonyme)

### 2. Configurer les variables dans Vercel

1. Allez sur votre projet Vercel : https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez les variables suivantes :

#### Variables requises :

| Nom de la variable | Valeur | Environnement |
|-------------------|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Votre Project URL depuis Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Votre anon/public key depuis Supabase | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Votre service_role key depuis Supabase (Settings → API) | Production, Preview, Development |

#### Variables optionnelles (pour les emails) :

| Nom de la variable | Valeur | Environnement |
|-------------------|--------|---------------|
| `RESEND_API_KEY` | Votre clé API Resend | Production, Preview, Development |

### 3. Redéployer

Après avoir ajouté les variables :
1. Allez dans **Deployments**
2. Cliquez sur les trois points (⋮) du dernier déploiement
3. Sélectionnez **Redeploy**
4. Vérifiez que les variables sont bien sélectionnées

### 4. Vérification

Après le redéploiement, votre site devrait fonctionner correctement. Les variables d'environnement sont maintenant disponibles dans votre application Next.js.

## Note importante

- Les variables commençant par `NEXT_PUBLIC_` sont exposées au client (navigateur)
- Ne partagez jamais votre `SUPABASE_SERVICE_ROLE_KEY` publiquement
- Assurez-vous que les variables sont définies pour **Production**, **Preview** et **Development** si nécessaire

## Commandes utiles

Pour vérifier vos variables d'environnement localement, créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
RESEND_API_KEY=votre_resend_key
```

Puis redémarrez votre serveur de développement.

