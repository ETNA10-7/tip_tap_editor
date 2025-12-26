# Authentication Flow Explanation

## 🔍 What's Happening: Step-by-Step Breakdown

### **Expected Flow (How It Should Work)**

1. **User logs in** → `signIn()` action is called
2. **Convex Auth creates session** → Stores JWT token in `localStorage` as `__convexAuthJWT_http1270013210`
3. **ConvexAuthProvider reads token** → On page load, reads token from `localStorage`
4. **Token sent with queries** → Every Convex query includes the JWT token in WebSocket headers
5. **Backend validates token** → `auth.getUserId(ctx)` extracts `userId` from token
6. **User document fetched** → `getCurrentUser` query returns user from `users` table
7. **UI updates** → `useAuth()` hook receives user object, `isAuthenticated` becomes `true`

---

## ❌ What's Actually Happening (The Problem)

### **Step 1: Login Succeeds ✅**
```
[AuthPage] ✅ Sign-in successful, session stored
[AuthPage] Session keys in localStorage: ["__convexAuthJWT_http1270013210", "__convexAuthRefreshToken_http1270013210"]
```
**Status:** ✅ Tokens ARE stored in localStorage

### **Step 2: Page Reloads ✅**
```
[ConvexClientProvider] ✅ Auth tokens found in localStorage: ["__convexAuthJWT_http1270013210", ...]
```
**Status:** ✅ Tokens ARE present after reload

### **Step 3: Query Runs ❌**
```
[CONVEX Q(users:getCurrentUser)] [LOG] '[getCurrentUser] ❌ No userId found - session token not sent with query'
[CONVEX Q(users:getCurrentUser)] [LOG] '[getCurrentUser] This means ConvexAuthProvider is not sending session token with the query'
```
**Status:** ❌ **THIS IS THE PROBLEM** - Token exists but is NOT being sent with the query

### **Step 4: User is Null ❌**
```
[useAuth] ❌ User not authenticated - user is null
```
**Status:** ❌ Because `getCurrentUser` returned `null` (no `userId` found)

---

## 🔴 Root Cause: Why Token Isn't Being Sent

### **The Issue:**
ConvexAuthProvider should automatically:
1. Read JWT token from `localStorage` on initialization
2. Inject token into WebSocket connection headers
3. Send token with every query

**But it's NOT doing step 2 and 3.**

### **Why This Happens:**

1. **Token Storage Format:**
   - Token is stored as: `__convexAuthJWT_http1270013210`
   - The `_http1270013210` part is the `storageNamespace` (based on Convex URL)
   - ConvexAuthProvider should read this automatically

2. **WebSocket Connection:**
   - Convex uses WebSocket for real-time queries
   - The JWT token must be sent in WebSocket connection headers
   - If token isn't in headers, backend can't validate it

3. **The Gap:**
   - Token exists in `localStorage` ✅
   - ConvexAuthProvider should read it ✅
   - But token is NOT being injected into WebSocket headers ❌

---

## 📊 Code Flow Analysis

### **1. Login Process (`app/auth/page.tsx`)**

```typescript
// User clicks "Sign in"
const result = await signIn("password", { email, password });

if (result.signingIn) {
  // ✅ Session token is stored in localStorage
  console.log("[AuthPage] ✅ Sign-in successful, session stored");
  
  // ✅ We can see tokens in localStorage
  console.log("[AuthPage] Session keys in localStorage:", sessionKeys);
  
  // ⚠️ Page reloads to pick up tokens
  setTimeout(() => {
    window.location.href = redirectTo; // Full page reload
  }, 200);
}
```

**What happens:**
- ✅ `signIn()` stores tokens in `localStorage`
- ✅ Tokens are visible in browser DevTools
- ✅ Page reloads to initialize ConvexAuthProvider

---

### **2. Provider Initialization (`app/ConvexClientProvider.tsx`)**

```typescript
const convex = useMemo(() => {
  const client = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  
  // ✅ Tokens are found in localStorage
  console.log("[ConvexClientProvider] ✅ Auth tokens found in localStorage:", authKeys);
  
  return client;
}, []);

return (
  <ConvexAuthProvider client={convex}>
    <ConvexProvider client={convex}>{children}</ConvexProvider>
  </ConvexAuthProvider>
);
```

**What happens:**
- ✅ ConvexAuthProvider wraps ConvexProvider
- ✅ Tokens are visible in `localStorage`
- ❌ **But tokens are NOT being sent with queries**

---

### **3. Query Execution (`convex/users.ts`)**

```typescript
export const getCurrentUser = query(async (ctx) => {
  // Try to get userId from session token
  const userId = await auth.getUserId(ctx);
  
  if (!userId) {
    // ❌ THIS IS WHERE IT FAILS
    console.log("[getCurrentUser] ❌ No userId found - session token not sent with query");
    return null; // Returns null because no token was received
  }
  
  // This code never runs because userId is null
  const user = await ctx.db.get(userId);
  return user;
});
```

**What happens:**
- ❌ `auth.getUserId(ctx)` returns `null`
- ❌ This means `ctx.auth.getUserIdentity()` received no JWT token
- ❌ Query returns `null` instead of user object

---

### **4. Hook Result (`hooks/useAuth.ts`)**

```typescript
export function useAuth() {
  // Calls getCurrentUser query
  const user = useQuery(api.users.getCurrentUser);
  
  // user is null because getCurrentUser returned null
  const isAuthenticated = user !== null && user !== undefined; // false
  
  if (!isLoading) {
    if (user) {
      // ❌ This never runs
    } else {
      // ✅ This runs - user is null
      console.log("[useAuth] ❌ User not authenticated - user is null");
    }
  }
  
  return { user: null, isAuthenticated: false, isLoading: false };
}
```

**What happens:**
- ❌ `getCurrentUser` returns `null`
- ❌ `user` is `null` in the hook
- ❌ `isAuthenticated` is `false`
- ❌ UI shows "not authenticated" even though tokens exist

---

## 🎯 Why User Should NOT Be Null

### **The Invariant (Rule That Must Always Be True):**

```
IF user is authenticated (has valid session token)
THEN user object MUST exist in database
AND getCurrentUser MUST return user object (never null)
```

### **Current State:**
```
✅ Session token exists in localStorage
❌ Token is NOT sent with query
❌ auth.getUserId(ctx) returns null
❌ getCurrentUser returns null
❌ useAuth() returns { user: null, isAuthenticated: false }
```

### **Expected State:**
```
✅ Session token exists in localStorage
✅ Token IS sent with query
✅ auth.getUserId(ctx) returns userId
✅ getCurrentUser returns user object
✅ useAuth() returns { user: {...}, isAuthenticated: true }
```

---

## 🔧 What Needs to Be Fixed

### **The Core Problem:**
ConvexAuthProvider is not injecting the JWT token into WebSocket connection headers.

### **Possible Causes:**

1. **Timing Issue:**
   - WebSocket connects before ConvexAuthProvider reads token
   - Token is read but not injected into existing connection

2. **Storage Namespace Mismatch:**
   - Token stored as `__convexAuthJWT_http1270013210`
   - ConvexAuthProvider looking for different key format

3. **Provider Initialization Order:**
   - ConvexProvider initializes before ConvexAuthProvider
   - WebSocket connection established without auth context

4. **Version Bug:**
   - `@convex-dev/auth` v0.0.47 might have a bug
   - Token injection not working correctly

---

## 📝 Summary

### **What Works:**
- ✅ Login/signup stores tokens in localStorage
- ✅ Tokens persist after page reload
- ✅ Tokens are visible in browser DevTools
- ✅ ConvexAuthProvider finds tokens in localStorage

### **What Doesn't Work:**
- ❌ Tokens are NOT sent with WebSocket queries
- ❌ Backend receives no JWT token
- ❌ `auth.getUserId(ctx)` returns `null`
- ❌ `getCurrentUser` returns `null`
- ❌ `useAuth()` reports user as `null`
- ❌ UI shows "not authenticated" even with valid tokens

### **The Fix Needed:**
Ensure ConvexAuthProvider properly injects JWT tokens into WebSocket connection headers so that:
1. Every query includes the token
2. Backend can validate the session
3. `auth.getUserId(ctx)` returns the `userId`
4. `getCurrentUser` returns the user object
5. `useAuth()` correctly reports authentication status

---

## 🐛 Error Messages Explained

### **Error 1: "No userId found - session token not sent with query"**
**Meaning:** The backend received a query but no JWT token was included in the request.

**Why:** ConvexAuthProvider didn't inject the token into WebSocket headers.

### **Error 2: "User not authenticated - user is null"**
**Meaning:** The `getCurrentUser` query returned `null` because no `userId` was found.

**Why:** Without a JWT token, `auth.getUserId(ctx)` returns `null`, so the query returns `null`.

### **Error 3: "WebSocket reconnected"**
**Meaning:** The WebSocket connection was re-established, but still without the auth token.

**Why:** The connection is being made before ConvexAuthProvider injects the token.

---

## ✅ What We've Done to Fix It

1. **Added debugging logs** to track token storage and retrieval
2. **Ensured page reload** after login to initialize ConvexAuthProvider
3. **Added error handling** to detect when user should exist but doesn't
4. **Removed artificial delays** (setTimeout) to make auth deterministic
5. **Added safety checks** to ensure user is never null when authenticated

**But the core issue remains:** ConvexAuthProvider is not sending tokens with queries.

---

## 🚀 Next Steps

1. **Verify token format** matches what ConvexAuthProvider expects
2. **Check WebSocket connection** to see if headers include JWT token
3. **Test with Convex Auth example** to compare behavior
4. **Consider upgrading** `@convex-dev/auth` if newer version fixes this
5. **Manual token injection** as a workaround if needed


















