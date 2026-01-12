# Collective Synthesizer - Complete Implementation Documentation

> **Project**: AI-Powered Collaborative Decision Making Platform  
> **Tech Stack**: React, TypeScript, Supabase, Tailwind CSS, shadcn/ui  
> **Documentation Date**: January 2026

---

## Table of Contents

1. [Phase 1: Foundation & Core Features](#phase-1-foundation--core-features)
2. [Phase 2: Quick Wins - Templates & Resources](#phase-2-quick-wins---templates--resources)
3. [Phase 3: Advanced Collaboration](#phase-3-advanced-collaboration)
4. [Database Overview](#database-overview)
5. [Design System](#design-system)
6. [Team Context Architecture](#team-context-architecture)

---

# Phase 1: Foundation & Core Features

## Overview

Phase 1 established the core foundation of the application with essential decision-making features, UI modernization, and 7 strategic enhancements.

## Core Features Implemented

### 1. PDF Export
**Component**: `ExportDecisionButton.tsx`

**Features:**
- Full decision export with all details
- Options, votes, and criteria included
- Uses `html2canvas` + `jspdf`
- Professional formatting

**Implementation:**
```typescript
- generatePDF() function
- Canvas rendering of decision details
- PDF generation with proper pagination
- Download trigger
```

### 2. Decision Status Workflow
**Modified**: `Decisions.tsx`, `ProposalDetails.tsx`

**Status Types:**
- Draft
- Active
- Completed
- Archived

**Features:**
- Status filtering in decisions list
- Archive functionality
- Status badge indicators
- Workflow transitions

### 3. Blind Voting Mode
**Database**: Added `is_blind` column to proposals

**Features:**
- Hide results until user votes
- Blur overlay for non-voters
- Reveal after participation
- Analytics conditional display

**Implementation:**
- Schema modification for `is_blind` boolean
- Conditional rendering in Analytics page
- Vote status checking

### 4. Rich Notification Center
**Table**: `notifications`

**Columns:**
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `type` (text, default: 'info')
- `title` (text)
- `message` (text)
- `link` (text, nullable) - URL to related content
- `is_read` (boolean, default: false)
- `created_at` (timestamptz)

**Features:**
- Real-time notifications
- Notification types: proposal, vote, mention, system
- Mark as read/unread
- Notification bell with badge count
- Auto-generation via triggers

**Component**: `NotificationBell.tsx`

### 5. Detailed Contribution History
**Table**: `contribution_history`

**Columns:**
- `id`, `contribution_id`, `changed_by`
- `field_changed`, `old_value`, `new_value`
- `changed_at`

**Features:**
- Track all contribution edits
- Audit trail for changes
- Version history
- Auto-tracking via triggers

### 6. Devil's Advocate AI Agent
**Component**: `AiCritique.tsx`

**Features:**
- AI-powered critique of proposals
- Challenge weak arguments
- Identify biases
- Surface overlooked risks
- Gemini API integration (prepared)

### 7. Visual Decision Graph
**Features:**
- Parent-child decision relationships
- Visual dependency tree
- Interactive graph navigation
- Decision lineage tracking

**Implementation:**
- `parent_decision_id` FK in proposals
- Graph visualization component
- Relationship mapping

### 8. Global UI Modernization

**Pages Updated:**
- Dashboard - Glassmorphic stats, gradient backgrounds
- Decisions - Enhanced cards with hover effects
- Analytics - Modern chart containers
- Activity Log - Timeline redesign
- ProposalDetails - Enhanced header and layout
- Teams - Banner modernization

**Design Elements:**
- Glassmorphism effects
- Smooth transitions
- Micro-animations
- Gradient backgrounds
- Improved typography
- Better spacing

---

# Phase 2: Quick Wins - Templates & Resources

## Overview

Phase 2 added productivity features to streamline decision creation and resource management.

## Database Schema

### 1. `decision_templates` Table

**Columns:**
- `id` (uuid, PK)
- `team_id` (uuid, FK → teams, nullable)
- `created_by` (uuid, FK → profiles, nullable)
- `title` (text)
- `description` (text, nullable)
- `category` (text, nullable) - 'hiring', 'budget', 'strategy', 'product', 'vendor', 'other'
- `framework` (text, nullable) - 'swot', 'six-hats', 'pros-cons', 'weighted-criteria'
- `criteria` (jsonb, nullable) - Array of criterion objects
- `options` (jsonb, nullable) - Array of option objects
- `is_public` (boolean, default: false)
- `use_count` (integer, default: 0)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**RLS Policies:**
- Public templates visible to all authenticated users
- Private templates visible to team members only
- Team members can create templates
- Creators and team admins can update/delete templates

**Features:**
- Template categories (hiring, budget, strategy, product, vendor)
- Decision frameworks (SWOT, Six Hats, Pros/Cons, Weighted Criteria)
- Public sharing
- Usage tracking
- Separate criteria and options JSON storage

### 2. `resources` Table

**Columns:**
- `id` (uuid, PK)
- `team_id` (uuid, FK → teams)
- `proposal_id` (uuid, FK → proposals, nullable)
- `uploaded_by` (uuid, FK → profiles, nullable)
- `title` (text)
- `description` (text, nullable)
- `file_url` (text, nullable)
- `file_type` (text, nullable) - 'pdf', 'doc', 'image', 'link', 'video'
- `file_size` (bigint, nullable)
- `tags` (text[], nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**RLS Policies:**
- Team members can view resources
- Team members can upload/create resources
- Uploaders and team admins can update/delete resources

**Features:**
- Multiple file types (PDF, docs, images, videos, links)
- Tag-based organization
- File upload to Supabase Storage (`uploads` bucket)
- Proposal linking

## Services Layer

### Templates Service (`src/services/templatesService.ts`)

**Functions:**
- `fetchTemplates(teamId?, includePublic)` - List templates with filtering
- `fetchTemplateById(id)` - Get single template
- `createTemplate(template)` - Create new template
- `updateTemplate(id, updates)` - Update existing
- `deleteTemplate(id)` - Delete template
- `incrementTemplateUseCount(id)` - Track usage

### Resources Service (`src/services/resourcesService.ts`)

**Functions:**
- `fetchResources(teamId, proposalId?)` - List with filtering
- `fetchResourceById(id)` - Get single resource
- `createResource(resource)` - Create new
- `updateResource(id, updates)` - Update existing
- `deleteResource(id)` - Delete resource

## TypeScript Types

**File**: `src/types/phase2.ts`

```typescript
interface DecisionTemplate {
  id: string;
  team_id: string | null;
  created_by: string | null;
  title: string;
  description: string | null;
  category: 'hiring' | 'budget' | 'strategy' | 'product' | 'vendor' | 'other' | null;
  framework: 'swot' | 'six-hats' | 'pros-cons' | 'weighted-criteria' | null;
  criteria: any | null;   // JSONB - array of criterion objects
  options: any | null;    // JSONB - array of option objects
  is_public: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

interface Resource {
  id: string;
  team_id: string;
  proposal_id: string | null;
  uploaded_by: string | null;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: 'pdf' | 'doc' | 'image' | 'link' | 'video' | null;
  file_size: number | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}
```

## Frontend Pages

### 1. Templates Library (`src/pages/Templates.tsx`)

**Features:**
- Template browsing with category filters
- Public/private toggle
- Create from scratch or duplicate
- Template preview
- "Use Template" → pre-fills Create Proposal
- Usage statistics

**Components:**
- Template cards with metadata
- Create dialog
- Preview modal

### 2. Notifications Center (`src/pages/Notifications.tsx`)

**Features:**
- Real-time notification feed
- Type filtering (proposal, vote, mention, system)
- Mark as read/unread
- Notification grouping
- Badge count in header

**Integration:**
- Supabase real-time subscriptions
- NotificationBell component
- Auto-refresh on new notifications

### 3. Resources Hub (`src/pages/Resources.tsx`)

**Features:**
- Resource library view
- File upload (PDF, images, docs)
- Link creation
- Tag-based filtering
- Search functionality
- Resource preview
- Proposal linking
- Download/view

**Storage:**
- Supabase Storage `uploads` bucket
- Automatic cleanup on delete

## Migration File

**File**: `supabase/migrations/20260110_create_templates_resources.sql`

**Includes:**
- Table creation DDL
- RLS policies
- Indexes for performance
- Update triggers
- Foreign key constraints

---

# Phase 3: Advanced Collaboration

## Overview

Phase 3 introduces advanced features for team collaboration including calendar management, OKR tracking, virtual meetings, and AI-powered insights.

## Database Schema

### Tables Created

#### 1. `decision_events`
Calendar events linked to decisions or team-level.

**Columns:**
- `id` (uuid, PK)
- `team_id` (uuid, FK → teams)
- `proposal_id` (uuid, FK → proposals, nullable) - NULL for team-level events
- `title` (text)
- `description` (text, nullable)
- `event_date` (timestamptz)
- `event_type` (text) - 'deadline', 'milestone', 'review'
- `is_completed` (boolean, default: false)
- `created_by` (uuid, FK → profiles, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**RLS Policies:**
- Team members can view events
- Team members can create events
- Creators and team admins can update/delete events

#### 2. `objectives`
Team goals (OKR methodology).

**Columns:**
- `id` (uuid, PK)
- `team_id` (uuid, FK → teams)
- `title` (text)
- `description` (text, nullable)
- `owner_id` (uuid, FK → profiles, nullable)
- `parent_objective_id` (uuid, FK → objectives, nullable) - For nested objectives
- `status` (text, default: 'active') - 'active', 'completed', 'archived'
- `progress` (integer, default: 0) - 0-100 percentage
- `start_date` (date, nullable)
- `target_date` (date, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**RLS Policies:**
- Team members can view objectives
- Team members can create objectives
- Owners and team admins can update/delete objectives

#### 3. `key_results`
Measurable KR tracking.

**Columns:**
- `id` (uuid, PK)
- `objective_id` (uuid, FK → objectives)
- `title` (text)
- `description` (text, nullable)
- `metric_type` (text, nullable) - 'percentage', 'number', 'boolean'
- `target_value` (numeric, nullable)
- `current_value` (numeric, default: 0)
- `unit` (text, nullable) - '$', '%', 'users', etc.
- `proposal_id` (uuid, FK → proposals, nullable) - Link KR to a decision
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**RLS Policies:**
- Team members can view key results (via objective join)
- Team members can create key results
- Team members can update key results
- Objective owners and team admins can delete key results

#### 4. `meeting_rooms`
Virtual collaboration spaces.

**Columns:**
- `id` (uuid, PK)
- `team_id` (uuid, FK → teams)
- `proposal_id` (uuid, FK → proposals, nullable) - Link meeting to a decision
- `title` (text)
- `description` (text, nullable)
- `status` (text, default: 'scheduled') - 'scheduled', 'active', 'live', 'ended', 'completed', 'cancelled'
- `host_id` (uuid, FK → profiles, nullable)
- `scheduled_start` (timestamptz, nullable)
- `scheduled_end` (timestamptz, nullable)
- `actual_start` (timestamptz, nullable)
- `actual_end` (timestamptz, nullable)
- `max_participants` (integer, default: 50)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**RLS Policies:**
- Team members can view meetings
- Team members can create meetings
- Hosts and team admins can update/delete meetings

#### 5. `meeting_participants`
Participant tracking.

**Columns:**
- `id` (uuid, PK)
- `meeting_id` (uuid, FK → meeting_rooms)
- `user_id` (uuid, FK → profiles)
- `joined_at` (timestamptz, default: now())
- `left_at` (timestamptz, nullable)
- `is_active` (boolean, default: true)

**RLS Policies:**
- Team members can view participants (via meeting room join)
- Users can join meetings (insert with own user_id)
- Users can update own participation
- Users can leave meetings (delete own record)

#### 6. `ai_insights`
AI-generated decision insights.

**Columns:**
- `id` (uuid, PK)
- `proposal_id` (uuid, FK → proposals) - NOT NULL, links to proposal
- `insight_type` (text) - 'sentiment', 'prediction', 'bias', 'suggestion'
- `title` (text)
- `content` (jsonb) - Structured insight data (NOT text description)
- `confidence_score` (numeric, nullable) - 0-1 scale
- `generated_at` (timestamptz, default: now())
- `expires_at` (timestamptz, nullable)
- `created_at` (timestamptz)

**Note:** No direct `team_id` column - team is derived via `proposals.team_id` join.

**RLS Policies:**
- Team members can view insights (via proposal join)
- System/Edge Functions create insights (service role)

**Content Structure Examples:**
```typescript
// Sentiment insight
{ overall_sentiment: 'positive', sentiment_scores: {...}, key_themes: [...] }
// Prediction insight
{ predicted_outcome: '...', probability: 0.85, contributing_factors: [...] }
// Bias insight
{ bias_type: '...', severity: 'medium', mitigation_suggestions: [...] }
// Suggestion insight
{ suggestion_type: 'improvement', description: '...', rationale: '...' }
```

### Database Types & Enums

**Note:** Most "enums" are stored as `text` columns with application-level validation:

- **Event Type** (text): 'deadline', 'milestone', 'review'
- **Objective Status** (text): 'active', 'completed', 'archived'
- **Metric Type** (text): 'percentage', 'number', 'boolean'
- **Meeting Status** (text): 'scheduled', 'active', 'live', 'ended', 'completed', 'cancelled'
- **Insight Type** (text): 'sentiment', 'prediction', 'bias', 'suggestion'

**Actual Enums in Database:**
- `team_role`: 'owner', 'admin', 'member', 'Admin', 'Member'
- `join_policy_enum`: 'open', 'application', 'invite_only'

## Services Layer

### Calendar Service (`src/services/calendarService.ts`)

**Functions:**
- `fetchEvents(teamId, startDate, endDate)`
- `fetchEventById(id)`
- `createEvent(event)`
- `updateEvent(id, updates)`
- `deleteEvent(id)`
- `markEventComplete(id)`

### Goals Service (`src/services/goalsService.ts`)

**Objectives:**
- `fetchObjectives(teamId, status?)`
- `fetchObjectiveById(id)`
- `createObjective(objective)`
- `updateObjective(id, updates)`
- `deleteObjective(id)`

**Key Results:**
- `fetchKeyResults(objectiveId)`
- `createKeyResult(keyResult)`
- `updateKeyResult(id, updates)`
- `updateKeyResultProgress(id, currentValue)`
- `deleteKeyResult(id)`
- `calculateObjectiveProgress(objectiveId)`
- `fetchObjectivesWithKeyResults(teamId)`

### Meetings Service (`src/services/meetingsService.ts`)

**Rooms:**
- `fetchMeetings(teamId, status?)` - List meetings for team
- `fetchMeetingById(id)` - Get single meeting
- `createMeeting(meeting)` - Create new meeting
- `updateMeeting(id, updates)` - Update meeting
- `deleteMeeting(id)` - Delete meeting
- `startMeeting(id)` - Set status to 'live', record actual_start
- `endMeeting(id)` - Set status to 'ended', record actual_end

**Participants:**
- `fetchParticipants(meetingId)` - List participants
- `joinMeeting(meetingId, userId)` - Join a meeting
- `leaveMeeting(meetingId, userId)` - Leave meeting (set is_active=false)
- `isUserInMeeting(meetingId, userId)` - Check if user is active
- `getActiveParticipantsCount(meetingId)` - Count active participants
- `subscribeToParticipants(meetingId, callback)` - Real-time subscription

### AI Service (`src/services/aiService.ts`)

**Core Functions:**
- `fetchInsights(proposalId, type?)` - Get insights for a proposal
- `fetchInsightsByTeam(teamId, type?)` - Get all insights for team (joins via proposals)
- `fetchInsightById(id)` - Get single insight
- `createInsight(insight)` - Create new insight (system use)
- `deleteInsight(id)` - Delete an insight

**AI Generation:**
- `generateInsights(proposalId)` - Trigger Edge Function to generate insights
- `analyzeSentiment(proposalId)` - Get or generate sentiment analysis
- `predictOutcome(proposalId)` - Get or generate outcome prediction
- `detectBias(proposalId)` - Get or generate bias detection
- `getSuggestions(proposalId)` - Get suggestion insights

**Utilities:**
- `areInsightsStale(proposalId, maxAgeHours?)` - Check if refresh needed
- `refreshInsightsIfStale(proposalId)` - Auto-refresh stale insights
- `deleteExpiredInsights(proposalId)` - Clean up expired insights

**Transform Helper:**
- `transformInsight(raw)` - Adds UI-friendly `description` and `confidence` (0-100) from raw DB data

## Frontend Pages

### 1. Decision Calendar (`src/pages/DecisionCalendar.tsx`)

**Features:**
- Compact monthly view (60px cells)
- Event color coding (deadline=red, milestone=blue, review=green)
- Up to 2 events per day shown
- Date selection with details panel
- Event creation/deletion
- Completion tracking
- Month navigation

**Tech:**
- Uses `date-fns`
- Real-time from calendarService
- Team context integration

### 2. Goals & OKRs (`src/pages/Goals.tsx`)

**Features:**
- Objectives with progress bars
- Key results per objective
- Auto progress calculation
- Statistics: active count, avg progress, KR count
- Create/delete objectives
- Status badges

**Progress Logic:**
- Percentage: direct value
- Number: (current/target) * 100
- Boolean: 100% if true

### 3. Meeting Rooms (`src/pages/MeetingRooms.tsx`)

**Features:**
- Live meetings (green badges, pulse)
- Scheduled meetings
- Create immediate or scheduled
- Join/leave functionality
- Participant avatars (max 5 shown)
- Delete meetings
- Status tracking

### 4. AI Insights (`src/pages/AIInsights.tsx`)

**Features:**
- Insight types with icons/colors:
  - 📈 Consensus Prediction (emerald)
  - ⚠️ Bias Detection (orange)
  - 💡 Pattern Analysis (blue)
  - 🎯 Recommendations (purple)
- Confidence scores
- Statistics dashboard
- Gemini AI badge

---

# Database Overview

## Complete Table List

### Core Tables (Existing)
1. `profiles` - User profiles
2. `teams` - Team management
3. `team_members` - Team membership
4. `team_invites` - Pending invitations
5. `proposals` - Decision proposals
6. `options` - Decision options
7. `criteria` - Evaluation criteria
8. `votes` - User votes
9. `contributions` - Comments/feedback
10. `ratings` - Criteria ratings

### Phase 1 Additions
11. `notifications` - Notification center
12. `contribution_history` - Edit audit trail

### Phase 2 Additions
13. `decision_templates` - Reusable templates
14. `resources` - File/link resources

### Phase 3 Additions
15. `decision_events` - Calendar events
16. `objectives` - Team objectives (OKRs)
17. `key_results` - Measurable results
18. `meeting_rooms` - Virtual meetings
19. `meeting_participants` - Meeting attendance
20. `ai_insights` - AI-generated insights

## Storage Buckets

| Bucket | Public | Description |
|--------|--------|-------------|
| `avatars` | ✅ Yes | User profile pictures |
| `team-media` | ❌ No | Team banners, logos |
| `decision-images` | ✅ Yes | Proposal images/attachments |
| `uploads` | ❌ No | Resource files |
| `decision-input-files` | ❌ No | Decision input attachments |

---

# Design System

## Color Palette

**Primary**: Purple gradient (`from-purple-500 to-pink-500`)  
**Success**: Emerald (`emerald-500`)  
**Warning**: Orange (`orange-500`)  
**Info**: Blue (`blue-500`)  
**Error**: Red (`red-500`)  
**Neutral**: Gray scales

## Typography

- Headers: 2xl-3xl, bold
- Body: sm-base, regular
- Captions: xs, muted

## Components

**From shadcn/ui:**
- Button, Badge, Progress
- Card, Dialog, Dropdown
- Avatar, Tooltip, Toast
- Input, Textarea, Select

**Custom:**
- DashboardLayout - Main layout wrapper
- AppSidebar - Collapsible navigation
- NotificationBell - Alert center
- DecisionCard - Proposal preview
- TeamSelector - Team switcher

## Design Patterns

**All phases share:**
- Glassmorphism (backdrop-blur, transparent backgrounds)
- Light/dark mode via Tailwind `dark:`
- Compact spacing (reduced padding/gaps)
- Smooth transitions (duration-300)
- Hover effects
- Loading states with spinners
- Empty states with icons
- Toast notifications

---

# Team Context Architecture

## useTeam Hook

```typescript
const { currentTeam, teams, setCurrentTeam } = useTeam();
```

**Features:**
- Automatic team selection
- Persisted to localStorage (`consensus_active_team_id`)
- Fallback to first team
- Real-time team updates

**Integration:**
All Phase 2 & 3 pages require team context:
- Check `if (!currentTeam)` → show empty state
- Filter data by `team_id`
- Team-specific permissions

## Team Provider

**Location**: `src/contexts/TeamContext.tsx`

**Provides:**
- Current team state
- Teams list
- Team CRUD operations
- Member management
- Invite handling

---

# Summary Statistics

## Phase 1
- **Features**: 7 major enhancements
- **Tables**: 2 new (notifications, contribution_history)
- **Pages**: 6 modernized
- **Components**: 3 new

## Phase 2
- **Tables**: 2 new (templates, resources)
- **Services**: 2 new
- **Pages**: 3 functional
- **Storage**: File upload integration

## Phase 3
- **Tables**: 6 new
- **Enums**: 5 new
- **Services**: 4 new
- **Pages**: 4 new
- **Types**: Complete TypeScript coverage

## Total Codebase
- **Database Tables**: 20+
- **Service Files**: 10+
- **Frontend Pages**: 15+
- **TypeScript Types**: Comprehensive
- **RLS Policies**: Complete security layer
- **Lines of Code**: ~5,000+ LOC

---

# Future Roadmap

**Potential Enhancements:**
- Gemini AI real integration
- Video conferencing in meetings
- External calendar sync
- Advanced analytics
- Mobile responsive optimization
- Automated meeting summaries
- Sentiment analysis
- Workflow automation

---

**Documentation Version**: 1.1  
**Last Updated**: January 11, 2026  
**Status**: Phase 3 Complete ✅  
**Schema Verified**: Matches `supabase/current_schema/` ✅
