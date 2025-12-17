# Authentication Setup Guide

## ✅ JWT_PRIVATE_KEY Persistence

**Good news:** Once you set `JWT_PRIVATE_KEY` via `npx convex env set`, it persists in your Convex deployment. You **don't need to run the script every time**.

The key is stored in your Convex deployment's environment variables and will be available every time you run `npx convex dev`.

**To set it once (if not already set):**
```bash
# Make sure npx convex dev is running, then in another terminal:
./set-jwt-while-running.sh
```

## 📁 New Auth Folder Structure

All authentication pages are now organized under `/app/auth/`:

```
app/auth/
├── login/          # Sign in page
├── signup/         # Create account page
├── logout/         # Sign out page (auto-redirects)
└── settings/       # Account settings & password change
```

## 🎨 Features Implemented

### 1. **Profile Dropdown Menu** (`components/user-menu.tsx`)
- Shows user avatar (first letter of email)
- Displays email on hover/click
- Dropdown includes:
  - Account Settings link
  - Sign Out button
- Clean, Clerk-like design

### 2. **Improved Login/Signup Pages**
- Better UI with proper form validation
- Automatic redirects after successful auth
- Error handling with user-friendly messages
- Links between login and signup pages

### 3. **Account Settings Page** (`/auth/settings`)
- View profile information (email, account ID)
- Password change form (UI ready, backend coming soon)
- Sign out button
- Protected route (redirects to login if not authenticated)

### 4. **Automatic Redirects**
- After login: redirects to home page
- After signup: redirects to home page
- After logout: redirects to home page
- Settings page: redirects to login if not authenticated

## 🔗 Updated Routes

- `/auth/login` - Sign in page
- `/auth/signup` - Create account page
- `/auth/logout` - Sign out (auto-redirects)
- `/auth/settings` - Account settings

Old routes (`/login`, `/signup`) have been removed and redirect to the new structure.

## 🚀 Usage

1. **Sign Up:** Visit `/auth/signup` to create an account
2. **Sign In:** Visit `/auth/login` to sign in
3. **Profile Menu:** Click your avatar in the header to see:
   - Your email
   - Account Settings
   - Sign Out
4. **Settings:** Visit `/auth/settings` to manage your account

## 📝 Notes

- Password change functionality is UI-ready but requires backend implementation
- The JWT_PRIVATE_KEY should persist after setting it once via the CLI
- All auth pages have proper loading states and error handling




