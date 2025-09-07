# 🔐 OAuth2 Setup Guide - Google & Microsoft

## ❌ Current Issue
**Error**: "OAuth client was not found" - Error 401: invalid_client

**Cause**: Using demo/placeholder credentials instead of real OAuth2 credentials from Google and Microsoft.

## ✅ Step-by-Step Setup

### 🔵 Google OAuth2 Setup

#### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Project name: "SaaS Platform" 
4. Click "Create"

#### 2. Enable Google+ API
1. In the sidebar: "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

#### 3. Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. User Type: "External" → Click "Create"
3. Fill required fields:
   - App name: "SaaS Platform"
   - User support email: your email
   - Developer contact: your email
4. Click "Save and Continue"
5. Scopes: Click "Save and Continue" (default is fine)
6. Test users: Add your email address
7. Click "Save and Continue"

#### 4. Create OAuth2 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "SaaS Platform Web Client"
5. Authorized redirect URIs: `http://localhost:4000/auth/google/callback`
6. Click "Create"
7. **Copy the Client ID and Client Secret** - you'll need these!

### 🔵 Microsoft OAuth2 Setup

#### 1. Go to Azure Portal
1. Visit [Azure Portal](https://portal.azure.com/)
2. Sign in with your Microsoft account

#### 2. Register Application
1. Search for "Azure Active Directory"
2. Go to "App registrations" → "New registration"
3. Name: "SaaS Platform"
4. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
5. Redirect URI: 
   - Type: "Web"
   - URI: `http://localhost:4000/auth/microsoft/callback`
6. Click "Register"

#### 3. Get Application ID
1. Copy the "Application (client) ID" - this is your Microsoft Client ID

#### 4. Create Client Secret
1. Go to "Certificates & secrets" → "New client secret"
2. Description: "SaaS Platform Secret"
3. Expires: 24 months
4. Click "Add"
5. **Copy the secret value immediately** - it won't be shown again!

#### 5. Set API Permissions
1. Go to "API permissions" → "Add a permission"
2. Microsoft Graph → Delegated permissions
3. Add these permissions:
   - `openid`
   - `profile` 
   - `email`
4. Click "Add permissions"

## 🔧 Update Configuration

### 1. Update .env File
Replace the placeholder values in `/saas-app-backend/src/common/envs/.env`:

```env
# OAuth2 Configuration
# Google OAuth2 - REPLACE WITH REAL CREDENTIALS
GOOGLE_CLIENT_ID=your_actual_google_client_id_from_step_4
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_from_step_4
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Microsoft OAuth2 - REPLACE WITH REAL CREDENTIALS  
MICROSOFT_CLIENT_ID=your_actual_microsoft_client_id_from_step_3
MICROSOFT_CLIENT_SECRET=your_actual_microsoft_client_secret_from_step_4
MICROSOFT_CALLBACK_URL=http://localhost:4000/auth/microsoft/callback
```

### 2. Restart Backend
```bash
cd saas-app-backend
npm run start:dev
```

### 3. Test OAuth2 Status
```bash
curl http://localhost:4000/auth/oauth2/status
```

Should return:
```json
{
  "configured": true,
  "providers": {
    "google": { "available": true, "configured": true },
    "microsoft": { "available": true, "configured": true }
  }
}
```

## 🧪 Testing

1. **Open frontend**: http://localhost:4201/signup
2. **Click "Continue with Google"**
3. **Should redirect to Google OAuth page** (not show error)
4. **Complete Google authentication**
5. **Should redirect back to your app with user logged in**

## 🔒 Security Notes

- **Keep credentials secret** - never commit real credentials to git
- **Use environment variables** for production deployment
- **Regenerate secrets** if accidentally exposed
- **Test users**: Add your email to Google OAuth consent screen test users during development

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| "OAuth client was not found" | Check Google Client ID is correct |
| "invalid_client" | Verify Google Client Secret is correct |
| "redirect_uri_mismatch" | Ensure callback URL matches exactly |
| "access_denied" | Add your email to test users in Google OAuth consent |

## ✅ Expected Flow

1. User clicks "Continue with Google"
2. Redirects to: `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_REAL_CLIENT_ID...`
3. User grants permissions
4. Google redirects to: `http://localhost:4000/auth/google/callback?code=OAUTH_CODE`
5. Backend exchanges code for user info
6. Creates/logs in user
7. Redirects to frontend with JWT token
8. User is logged in to dashboard

## 🎯 Quick Start Commands

```bash
# 1. Update .env with real credentials
# 2. Restart backend
cd saas-app-backend && npm run start:dev

# 3. Start frontend  
cd saas-app-frontend && ng serve --port 4201

# 4. Test OAuth status
curl http://localhost:4000/auth/oauth2/status

# 5. Open app and test Google login
open http://localhost:4201/signup
```