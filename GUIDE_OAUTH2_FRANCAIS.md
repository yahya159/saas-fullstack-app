# 🔐 Guide de Configuration OAuth2 - Google & Microsoft

## ❌ Problème Actuel
**Erreur**: "Le client OAuth est introuvable" - Erreur 401: invalid_client

**Cause**: Utilisation d'identifiants de démonstration au lieu de vrais identifiants OAuth2 de Google et Microsoft.

## ✅ Configuration Étape par Étape

### 🔵 Configuration Google OAuth2

#### 1. Créer un Projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur "Sélectionner un projet" → "Nouveau Projet"
3. Nom du projet : "Plateforme SaaS"
4. Cliquez sur "Créer"

#### 2. Configuration OAuth2 (PLUS BESOIN D'ACTIVER UNE API)
**IMPORTANT**: Google+ API n'existe plus depuis 2019. Pour OAuth2, nous utilisons Google Identity Services qui est automatiquement disponible.

**Ignorez cette étape** - passez directement à l'étape 3 !

#### 3. Configurer l'Écran de Consentement OAuth (OBLIGATOIRE)
1. Allez dans "API et Services" → "Écran de consentement OAuth"
2. Type d'utilisateur : "Externe" → Cliquez sur "Créer"
3. Remplissez les champs requis :
   - Nom de l'application : "Plateforme SaaS"
   - E-mail d'assistance : votre e-mail
   - Contact développeur : votre e-mail
4. Cliquez sur "Enregistrer et continuer"
5. Portées : Cliquez sur "Enregistrer et continuer" (par défaut c'est bon)
6. Utilisateurs de test : Ajoutez votre adresse e-mail
7. Cliquez sur "Enregistrer et continuer"

#### 4. Créer les Identifiants OAuth2 (PRINCIPAL)
1. Allez dans "API et Services" → "Identifiants"
2. Cliquez sur "Créer des identifiants" → "ID client OAuth 2.0"
3. Type d'application : "Application Web"
4. Nom : "Client Web Plateforme SaaS"
5. URI de redirection autorisés : `http://localhost:4000/auth/google/callback`
6. Cliquez sur "Créer"
7. **Copiez l'ID Client et le Secret Client** - vous en aurez besoin !

### 🔵 Configuration Microsoft OAuth2

#### 1. Aller sur le Portail Azure
1. Visitez [Portail Azure](https://portal.azure.com/)
2. Connectez-vous avec votre compte Microsoft

#### 2. Enregistrer l'Application
1. Recherchez "Azure Active Directory"
2. Allez dans "Inscriptions d'applications" → "Nouvelle inscription"
3. Nom : "Plateforme SaaS"
4. Types de comptes pris en charge : "Comptes dans un annuaire organisationnel et comptes Microsoft personnels"
5. URI de redirection :
   - Type : "Web"
   - URI : `http://localhost:4000/auth/microsoft/callback`
6. Cliquez sur "S'inscrire"

#### 3. Obtenir l'ID de l'Application
1. Copiez l'"ID d'application (client)" - c'est votre ID Client Microsoft

#### 4. Créer un Secret Client
1. Allez dans "Certificats et secrets" → "Nouveau secret client"
2. Description : "Secret Plateforme SaaS"
3. Expire : 24 mois
4. Cliquez sur "Ajouter"
5. **Copiez la valeur du secret immédiatement** - elle ne sera plus affichée !

#### 5. Définir les Autorisations API
1. Allez dans "Autorisations API" → "Ajouter une autorisation"
2. Microsoft Graph → Autorisations déléguées
3. Ajoutez ces autorisations :
   - `openid`
   - `profile`
   - `email`
4. Cliquez sur "Ajouter les autorisations"

## 🔧 Mettre à Jour la Configuration

### 1. Mettre à Jour le Fichier .env
Remplacez les valeurs dans `/saas-app-backend/src/common/envs/.env` :

```env
# Configuration OAuth2
# Google OAuth2 - REMPLACEZ PAR VOS VRAIS IDENTIFIANTS
GOOGLE_CLIENT_ID=votre_vrai_client_id_google_de_l_etape_4
GOOGLE_CLIENT_SECRET=votre_vrai_secret_client_google_de_l_etape_4
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Microsoft OAuth2 - REMPLACEZ PAR VOS VRAIS IDENTIFIANTS
MICROSOFT_CLIENT_ID=votre_vrai_client_id_microsoft_de_l_etape_3
MICROSOFT_CLIENT_SECRET=votre_vrai_secret_client_microsoft_de_l_etape_4
MICROSOFT_CALLBACK_URL=http://localhost:4000/auth/microsoft/callback
```

### 2. Redémarrer le Backend
```bash
cd saas-app-backend
npm run start:dev
```

### 3. Tester le Statut OAuth2
```bash
curl http://localhost:4000/auth/oauth2/status
```

Devrait retourner :
```json
{
  "configured": true,
  "providers": {
    "google": { "available": true, "configured": true },
    "microsoft": { "available": true, "configured": true }
  }
}
```

## 🧪 Tests

1. **Ouvrez le frontend** : http://localhost:4201/signup
2. **Cliquez sur "Se connecter avec Google"**
3. **Devrait rediriger vers la page OAuth de Google** (pas d'erreur)
4. **Complétez l'authentification Google**
5. **Devrait rediriger vers votre app avec l'utilisateur connecté**

## 🔒 Notes de Sécurité

- **Gardez les identifiants secrets** - ne jamais commiter les vrais identifiants dans git
- **Utilisez les variables d'environnement** pour le déploiement en production
- **Régénérez les secrets** s'ils sont accidentellement exposés
- **Utilisateurs de test** : Ajoutez votre e-mail aux utilisateurs de test de l'écran de consentement Google pendant le développement

## 🆘 Dépannage

| Erreur | Solution |
|--------|----------|
| "Le client OAuth est introuvable" | Vérifiez que l'ID Client Google est correct |
| "invalid_client" | Vérifiez que le Secret Client Google est correct |
| "redirect_uri_mismatch" | Assurez-vous que l'URL de callback correspond exactement |
| "access_denied" | Ajoutez votre e-mail aux utilisateurs de test dans l'écran de consentement Google |

## ✅ Flux Attendu

1. L'utilisateur clique sur "Se connecter avec Google"
2. Redirection vers : `https://accounts.google.com/o/oauth2/v2/auth?client_id=VOTRE_VRAI_CLIENT_ID...`
3. L'utilisateur accorde les autorisations
4. Google redirige vers : `http://localhost:4000/auth/google/callback?code=CODE_OAUTH`
5. Le backend échange le code pour les infos utilisateur
6. Crée/connecte l'utilisateur
7. Redirige vers le frontend avec le token JWT
8. L'utilisateur est connecté au tableau de bord

## 🎯 Commandes de Démarrage Rapide

```bash
# 1. Mettez à jour .env avec les vrais identifiants
# 2. Redémarrez le backend
cd saas-app-backend && npm run start:dev

# 3. Démarrez le frontend
cd saas-app-frontend && ng serve --port 4201

# 4. Testez le statut OAuth
curl http://localhost:4000/auth/oauth2/status

# 5. Ouvrez l'app et testez la connexion Google
open http://localhost:4201/signup
```

## 💡 Solution Immédiate

**Si vous voulez continuer le développement sans configurer OAuth2 maintenant :**

1. **Utilisez le formulaire d'inscription normal** (inscription manuelle)
2. **Ignorez les tests OAuth2** pour l'instant
3. **Configurez les vrais identifiants plus tard** quand vous serez prêt pour la production

L'implémentation OAuth2 est **complètement fonctionnelle** - elle a juste besoin des vrais identifiants de Google Cloud Console pour fonctionner avec l'authentification Google réelle !