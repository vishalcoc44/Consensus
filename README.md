# Consensus – Current Features

A concise list of features implemented in the app today.

## Authentication
- Email/password sign in and sign up (Supabase Auth)
- Google OAuth sign-in
- Forgot password flow (request reset link + set new password)
- Recovery hash routing helper to land on the reset page
- Basic route protection and auth session handling

## Dashboard
- Overview stats (active decisions, team members, velocity, etc.)
- Active decisions list
- Quick-create decision modal

## Teams
- List teams you belong to
- Create team (name, description, select members)
- Add members to a team
- Team details (members list, roles, remove member)
- Invite member via email (admin invite)
- Delete team

## Decisions
- Decisions list with search and status filter
- Create decision wizard (details → options → criteria with weights)
- Decision details page with:
  - Voting (including Abstain)
  - Criteria star ratings
  - Comment input
  - File upload (PDF/CSV, 10MB limit) via Supabase Storage
  - Real‑time discussion (messages + threaded replies)
  - Confirmation view after submission

## AI Recommendation
- Generate AI recommendation (Supabase Edge Function: `generate-recommendation`)
- Recommendation card with confidence and factor breakdown
- Per‑user Recommendation Settings (weights for support, criteria, sentiment, historical) with persistence

## Analytics
- Select decision and run analysis of inputs
- Weighted support score per option (bar chart)
- Sentiment breakdown (pie chart)
- Key themes and file insights placeholders
- Report summary and export button (UI)

## Settings
- Profile: update full name (Auth metadata + `profiles`)
- Privacy & Data: export data (JSON download), destructive action placeholder
- Security: change password scaffold, sign out from all devices, 2FA toggle placeholder, deactivate account placeholder
- AI Engine: tune recommendation weights (must total 100%)

## UI/UX
- Animated route transitions
- Scroll-triggered sections on landing
- Collapsible responsive sidebar
- Theming/styling consistent with auth pages

## Realtime & Storage
- Realtime updates for decision details and discussion
- Supabase Storage for decision input attachments

## Edge Functions
- `generate-recommendation`: computes and stores recommendation for a decision
- `notify-recommendation`: email notification scaffold (console mock)


