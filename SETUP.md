# Hamduk Digital Hub - Setup Guide

## Environment Variables

Required Supabase environment variables (already configured in Vercel):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Setup

Before using the app, ensure the `users` table exists with:
- `id` (uuid, primary key)
- `email` (text)
- `role` (text) - one of: 'Super Admin', 'Admin', 'Project Manager', 'Team Lead', 'Staff', 'Freelancer', 'Temp Specialist'
- `full_name` (text, nullable)
- `avatar_url` (text, nullable)
- `created_at` (timestamp)

Enable RLS on the users table:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

Create a policy allowing users to read their own profile:
```sql
CREATE POLICY "Users can read their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);
```

## Architecture Overview

### Authentication Flow
1. User visits app → middleware checks for `sb-access-token`
2. If missing → redirects to `/auth/login`
3. Login form uses Supabase Auth to authenticate
4. Token stored in cookie, user profile fetched from users table
5. All protected routes wrapped with `AuthenticatedLayout` which uses `useAuth()` hook

### Role-Based Access
- Navigation in sidebar is filtered by user role
- Module access controlled by `getNavigationForRole(role)` in `lib/navigation.ts`
- Role-gated pages (like Settings) check user role client-side

### Module Structure
- **Dashboard:** Overview, stats (all roles)
- **Team:** Team management (Super Admin, Admin, Project Manager)
- **Projects:** Project tracking (Super Admin, Admin, Project Manager, Team Lead)
- **Tasks:** Task management (all roles)
- **Approvals:** Approval workflows (Super Admin, Admin, Project Manager, Team Lead)
- **Reports:** Analytics (Super Admin, Admin, Project Manager, Team Lead, Staff)
- **Settings:** System configuration (Super Admin, Admin only)

## Testing the App Shell

### Test Login
1. Create a test user in Supabase with:
   - Email: test@example.com
   - Password: (set via Supabase dashboard)
   - Role: 'Super Admin' (to see all modules)
2. Navigate to http://localhost:3000
3. Should redirect to `/auth/login`
4. Sign in with test credentials
5. Should redirect to `/dashboard`

### Test Navigation
- Verify sidebar shows only modules accessible to user's role
- Click sidebar items to navigate
- Check collapsible sidebar on mobile (< 768px)
- Verify user dropdown shows profile, settings, and sign out options

### Test Protected Routes
- Try accessing `/dashboard` directly → should require login
- After login, refresh dashboard → should stay on dashboard
- Click sign out → should redirect to login

## Database Migration Path (Future)

To make module access dynamic instead of hardcoded:

1. Create `modules` table:
```sql
CREATE TABLE modules (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

2. Create `role_modules` join table:
```sql
CREATE TABLE role_modules (
  id BIGSERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  module_id BIGINT REFERENCES modules(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role, module_id)
);
```

3. Update `lib/navigation.ts` to query these tables instead of hardcoding

## Next Steps

1. **User Management Module** - Create users, assign roles, manage permissions
2. **Team Module** - Team members directory, assignments, performance tracking
3. **Projects Module** - Create projects, track status, manage deadlines
4. **Tasks Module** - Task board, assignments, progress tracking
5. **Approvals Module** - Workflow approvals, signatures, audit trail
6. **Reports Module** - Analytics dashboards, KPI tracking
7. **Settings Module** - System configuration, integrations, role management

Each module will be built separately and integrated into the main dashboard.
