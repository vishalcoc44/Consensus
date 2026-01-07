# Collective Synthesizer

## Project Overview

Collective Synthesizer is a collaborative decision-making platform built with React, TypeScript, and Supabase. The application enables teams to create proposals, gather contributions, analyze data, and reach consensus through a structured decision-making process.

## Technologies Used

- **Frontend**: React, TypeScript, Vite, shadcn/ui, Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Serverless Functions**: Supabase Edge Functions

## Supabase Integration Documentation

This project heavily integrates with Supabase for data storage, authentication, and serverless functions. Below is a comprehensive documentation of how Supabase is used throughout the codebase.

### Core Supabase Configuration

**`src/integrations/supabase/client.ts`**
- Creates and exports the main Supabase client instance used throughout the application
- Configures authentication settings including auto-refresh token, persistent sessions, and URL session detection
- This is the primary entry point for all Supabase interactions

**`src/utils/supabaseClient.ts`**
- Exports a typed Supabase client (`typedSupabase`) that provides type safety for database operations
- Includes helper functions like `extractProfileData` to handle Supabase response formats

**`src/types/supabase.ts`**
- Extends the original Supabase database types with custom types for the application
- Defines the `TypedSupabaseClient` type for strongly-typed database operations

### Authentication and User Management

**`src/components/auth/services/authService.ts`**
- Handles all authentication operations including:
  - User login with thorough session verification and cleanup
  - User registration with profile creation
  - Password reset functionality
  - Session management and verification
  - User profile management (fetch, create, update)
  - User data export and deletion for GDPR compliance

**`src/components/auth/AuthForm.tsx`**
- Manages the authentication UI and form submission
- Implements robust session clearing to prevent authentication issues
- Handles login/registration state and error handling
- Includes cookie and localStorage cleanup for Supabase tokens

**`src/hooks/useAuth.tsx`**
- Custom hook that provides authentication state and methods to components
- Sets up auth state listeners using Supabase's `onAuthStateChange`
- Provides signIn and signOut functionality
- Manages authentication loading and error states

**`src/App.tsx`**
- Configures global authentication state and session management
- Implements session verification and automatic refresh for invalid sessions
- Sets up protected routes based on authentication status
- Provides the Supabase client to the browser console for debugging

### Data Access and Management

**`src/hooks/useSupabaseQuery.tsx`**
- Generic hook for fetching data from Supabase tables
- Handles authentication requirements for queries
- Provides error handling and loading states
- Supports custom query functions and dependencies

**`src/hooks/useTeams.tsx`**
- Manages team data fetching, creation, and member management
- Implements team member invitation and role assignment
- Handles data relationships between teams, members, and profiles

**`src/utils/auditLogger.ts`**
- Logs user actions to the audit_logs table in Supabase
- Captures user ID, action type, timestamp, and additional details
- Provides security and compliance tracking

**`src/utils/consensusBuilder.ts`**
- Fetches proposal data, options, contributions, and criteria from Supabase
- Implements algorithms for consensus calculation and recommendation generation

**`src/utils/integrationService.ts`**
- Manages external integrations with Supabase storage
- Handles authentication for integration connections
- Invokes Supabase Edge Functions for data fetching and analysis

### Page Components with Supabase Integration

**`src/pages/Dashboard.tsx`**
- Fetches active decisions, team members count, and decision statistics
- Displays decision cards with data from proposals table
- Implements session verification before data fetching

**`src/pages/Decisions.tsx`**
- Retrieves all decisions with filtering and sorting capabilities
- Fetches contribution counts for each proposal
- Handles authentication verification before data access

**`src/pages/Teams.tsx`**
- Displays and manages team information and members
- Uses the useTeams hook for team data operations

**`src/pages/Settings.tsx`**
- Manages user profile settings and preferences
- Handles profile updates and password changes
- Implements account deletion functionality

**`src/pages/ResetPassword.tsx`**
- Verifies session and handles password reset operations

**`src/pages/ActivityLog.tsx`**
- Displays user activity from the audit_logs table
- Implements filtering and search functionality for logs

### Dashboard Components

**`src/components/dashboard/RecentActivity.tsx`**
- Fetches recent user activities from contributions
- Displays activity feed with user and proposal information
- Uses the extractProfileData helper for consistent profile handling

**`src/components/dashboard/DashboardLayout.tsx`**
- Implements the main dashboard layout with navigation
- Handles user session information display
- Provides sign-out functionality

**`src/components/dashboard/CreateDecisionButton.tsx`**
- Creates new proposals in the Supabase database
- Handles form validation and submission

### Serverless Functions

**`supabase/functions/generate-recommendation/index.ts`**
- Edge function that analyzes contributions and generates recommendations
- Accesses proposal, options, criteria, and contribution data
- Saves analysis results back to the proposal_analysis table

**`supabase/functions/fetch-integration-data/index.ts`**
- Retrieves data from external integrations
- Stores integration data in the integration_data table
- Links data to specific proposals

**`supabase/functions/analyze-integration-data/index.ts`**
- Processes integration data for insights
- Updates integration_data records with analysis results

### Database Schema Overview

The application uses the following key tables in Supabase:
- `profiles`: User profile information
- `teams`: Team information and settings
- `team_members`: Team membership and roles
- `proposals`: Decision proposals with metadata
- `proposal_options`: Options for each proposal
- `proposal_criteria`: Evaluation criteria for proposals
- `contributions`: User contributions to proposals
- `proposal_analysis`: Analysis results and recommendations
- `integration_data`: Data from external integrations
- `audit_logs`: Security and activity tracking

### Row Level Security (RLS) Policies

The database implements Row Level Security policies to ensure data access control:
- Users can view all proposals but can only modify their own
- Users can view all proposal analysis but can only modify their own
- Team members can view their team data
- Team admins have extended privileges for team management

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. The application will be available at http://localhost:5173/

## Deployment

This project can be deployed to any hosting platform that supports static sites. For the backend, you'll need to configure your own Supabase project and update the environment variables accordingly.

## Troubleshooting Authentication Issues

If you encounter authentication issues:
1. Clear browser cookies and local storage
2. Ensure your Supabase project has the correct RLS policies
3. Check browser console for detailed error messages
4. Verify that you're using the correct Supabase URL and API key
