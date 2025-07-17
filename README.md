# ConsensusAI

ConsensusAI is a modern, full-stack application designed to help teams make smarter, faster, and more inclusive decisions. It combines the power of human collaboration with AI-driven insights to streamline the decision-making process. The platform provides a centralized space for teams to create, discuss, and finalize decisions, backed by data analytics and a secure, real-time backend.

This is a responsive, full-stack application that includes a public-facing landing page and a complete authenticated user experience for team collaboration and decision management.

## Features

### Public-Facing Site
- **Animated Landing Page**: A visually engaging, animated landing page built with Framer Motion that introduces the product's value proposition.
- **Marketing Sections**: Includes sections for Features, Testimonials (social proof), and a final Call-to-Action (CTA).
- **User Authentication**: Secure and simple sign-in and sign-up flows.

### Core Application Features
- **Central Dashboard**: The main landing page for authenticated users, providing a high-level overview of key statistics (active decisions, team members, etc.) and a list of recent, active decisions.
- **Team Management**:
    - **Create & View Teams**: Users can create new teams, add a description, and invite members. The main teams page displays all teams a user is part of.
    - **Team Details**: A dedicated page for each team, listing all members and their roles.
    - **Add Members**: Easily add new members to an existing team.
- **Decision Management**:
    - **Multi-Step Decision Creation**: A comprehensive modal guides users through creating a new decision, including defining the title, description, deadline, associated team, possible options, and weighted evaluation criteria.
    - **Decision Hub**: A central page to view all decisions, with search and filtering by status (e.g., Pending, Approved).
    - **Detailed Decision View**: Each decision has its own page where team members can submit their input.
- **Input Collection**:
    - **Structured Input Form**: For each decision, users can vote for an option (or abstain), rate each criterion, leave comments, and upload supporting files.
    - **Submission Confirmation**: Users see a confirmation of their input after submitting, preventing duplicate entries.
- **Analytics & Insights**:
    - **Decision Analysis**: A dashboard to analyze the results of completed decisions.
    - **Data Visualizations**: Includes charts for "Weighted Support" (a score combining vote counts and sentiment), a breakdown of comment sentiment (Positive, Neutral, Negative), and a word cloud of key themes.
    - **Simulated AI**: The sentiment analysis is currently driven by a keyword-matching algorithm, and other AI features are placeholders, demonstrating the intended functionality.
- **User Settings**:
    - A dedicated, tabbed section for managing user account details, including Profile, Privacy, and Security settings.

## Tech Stack

- **Frontend**:
  - [React 19](https://react.dev/)
  - [Vite](https://vitejs.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [React Router](https://reactrouter.com/) for routing
  - [Framer Motion](https://www.framer.com/motion/) for animations
  - [Recharts](https://recharts.org/) for charts
  - [Tabler Icons](https://tabler-icons.io/) & [React Icons](https://react-icons.github.io/react-icons/) for icons
  - CSS with Custom Properties for styling

- **Backend**:
  - [Supabase](https://supabase.io/) for database, authentication, real-time features, and file storage.

- **Dev Tools**:
  - [ESLint](https://eslint.org/) for code linting
  - [TypeScript ESLint](https://typescript-eslint.io/) for TypeScript-specific linting rules

## Project Structure

```
Team/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/         # Static assets like images
│   ├── components/     # Reusable React components
│   │   ├── settings/   # Components for the settings page
│   │   ├── ui/         # Core UI elements like the sidebar
│   │   ├── AddMemberModal.tsx       # Modal to add members to a team.
│   │   ├── AnimatedPage.tsx         # Wrapper for page transition animations.
│   │   ├── CreateDecisionModal.tsx  # Multi-step modal for creating decisions.
│   │   ├── CreateTeamModal.tsx      # Modal for creating a new team.
│   │   ├── CTA.tsx                  # Call-to-action section for the landing page.
│   │   ├── Features.tsx             # Features section for the landing page.
│   │   ├── Footer.tsx               # Site-wide footer.
│   │   ├── Header.tsx               # Site-wide header for the public page.
│   │   ├── Hero.tsx                 # Hero section for the landing page.
│   │   ├── InputCollectionForm.tsx  # Form for collecting user input on a decision.
│   │   ├── Layout.tsx               # Main layout for the authenticated app (sidebar, etc.).
│   │   └── ... (and other UI components)
│   ├── lib/
│   │   ├── supabaseClient.ts # Initializes the Supabase client.
│   │   └── utils.ts        # Utility functions.
│   ├── pages/            # Top-level page components for each route.
│   │   ├── Analytics.tsx       # Page for analyzing decision results.
│   │   ├── Dashboard.tsx       # Main dashboard for authenticated users.
│   │   ├── DecisionDetails.tsx # Page to view and interact with a single decision.
│   │   ├── Decisions.tsx       # Page to view and manage all decisions.
│   │   ├── Settings.tsx        # Container page for all user settings.
│   │   ├── TeamDetails.tsx     # Page to view details of a single team.
│   │   └── Teams.tsx           # Page to view and manage all teams.
│   ├── styles/           # CSS files for styling components and pages.
│   ├── App.tsx           # Main application component with routing definitions.
│   ├── main.tsx          # Application entry point.
│   └── ...
├── .eslintrc.cjs       # ESLint configuration.
├── package.json        # Project dependencies and scripts.
├── README.md           # This file.
└── ...
```

## Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Team
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Supabase:**
    This project uses Supabase for its backend.
    - Go to `src/lib/supabaseClient.ts`.
    - You will find placeholder values for `supabaseUrl` and `supabaseAnonKey`.
    - Replace these with your actual Supabase project URL and anon key.

    *Note: As requested, the application currently uses hardcoded keys in `src/lib/supabaseClient.ts`. For a production environment, it is strongly recommended to use environment variables.*

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run preview`: Serves the production build locally for previewing.


