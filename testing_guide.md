# Manual Testing Guide: ConsensusAI Full Flow

This guide outlines the steps to manually verify the core functionality of the ConsensusAI platform. It is designed to test the full lifecycle of a decision, from creation to collaborative participation and analysis.

## Prerequisites

1.  **Backend**: Ensure your Supabase instance is running and connected (`.env.local` is configured).
2.  **Frontend**: Run the application locally using `npm run dev`.
3.  **Browser**: Use two different browsers or one browser incognito window to simulate multiple users (Admin vs. Member).

---

## Test Scenario 1: The "Happy Path" (Create, Invite, Vote, Analyze)

### Phase 1: Admin Setup & Proposal Creation
*Perform these steps in your **Main Browser Window**.*

1.  **Sign Up / Login**
    *   Navigate to `/login`.
    *   Log in with an existing admin account (or Sign Up if fresh DB).
    *   *Verification*: You are redirected to the `/dashboard` and see "Welcome back".

2.  **Create a New Proposal**
    *   Click **"New Decision"** button on the Dashboard.
    *   **Step 1 (Details)**:
        *   Title: "Team Building Event Location"
        *   Description: "Deciding where to go for Q3 team building."
        *   Deadline: Set to a future date (e.g., next week).
    *   **Step 2 (Options)**:
        *   Add Option 1: "Escape Room"
        *   Add Option 2: "Rooftop Dinner"
    *   **Step 3 (Criteria)**:
        *   Add Criterion 1: "Cost" (Weight: 30)
        *   Add Criterion 2: "Fun Factor" (Weight: 70)
        *   *Note*: Ensure weights sum to 100 if the UI enforces it, or just use arbitrary weights.
    *   **Finish**: Click "Create Proposal".
    *   *Verification*: You are redirected to the proposal detail page or dashboard list. The status should be "Active".

3.  **Verify Dashboard Updates**
    *   Go to `/dashboard`.
    *   *Verification*: The "Active Decisions" count should have incremented. Use the search bar to find "Team Building".

---

### Phase 2: Team Member Participation
*Perform these steps in an **Incognito Window** to simulate a different user.*

4.  **Second User Login**
    *   Navigate to `/login`.
    *   Log in as a different user (e.g., `member@example.com`).

5.  **Find & View Proposal**
    *   Navigate to `/dashboard`.
    *   Locate the "Team Building Event Location" proposal in the list.
    *   Click to view details.
    *   *Verification*: You should see the Title, Description, and the "Contribute" tab active.

6.  **Submit Contribution**
    *   **Select Option**: Choose "Rooftop Dinner".
    *   **Rate Criteria**:
        *   Rate "Cost": 4/10
        *   Rate "Fun Factor": 9/10
    *   **Comment**: Add a text comment: "Great for summer evenings!"
    *   Click **Submit**.
    *   *Verification*: Look for a success toast notification "Contribution Submitted". The view should switch to the "Overview" tab.

7.  **Attempt Duplicate Submission (Negative Test)**
    *   Try to switch back to the "Contribute" tab.
    *   *Verification*: You should see a message saying "You've already contributed" or the form should be disabled/hidden.

---

### Phase 3: Analysis & Consensus
*Return to your **Main Browser Window (Admin)**.*

8.  **View Real-time Updates**
    *   Go to the "Team Building" proposal details page.
    *   Navigate to the **Overview** (or Analytics) tab.
    *   *Verification*:
        *   **Participation Count**: Should now show at least 1 participant.
        *   **Vote Breakdown**: Should show a vote for "Rooftop Dinner".
        *   **Consensus Score**: Should be calculated (non-zero).

9.  **Check Activity Log**
    *   Navigate to `/dashboard/activity` (or click Activity in sidebar).
    *   *Verification*: You should see a new entry: "*Member Name* added new contribution to 'Team Building Event Location'".

---

## Test Scenario 2: Edge Cases

1.  **Expired Proposal**
    *   Create a proposal with a deadline in the **past** (if UI allows) or wait for a deadline to pass.
    *   *Verification*: Status should change to "Completed" or "Expired". Verify that the "Contribute" button is disabled for users.

2.  **Form Validation**
    *   Try creating a proposal *without* a Title.
    *   *Verification*: The "Next" or "Create" button should be disabled, or an error message should appear.

3.  **Empty Search**
    *   In the Dashboard, search for a chemically impossible string like "XyZ123".
    *   *Verification*: The list should filter down to show "No decisions match your filters".

---

## Troubleshooting Tests

If a step fails:
1.  **Check Console**: Open DevTools (F12) to see if there are any red network errors.
2.  **Check RLS**: If data isn't loading for the Second User, it may be a Row Level Security policy issue in Supabase (check `policies` on `proposals` table).
3.  **Check Network Tab**: Ensure API calls to Supabase are returning `200 OK`.
