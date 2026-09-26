# EduAdapt

"Your learning path should adapt to you."

EduAdapt is an AI-powered adaptive learning and student intelligence platform designed for the Smart India Hackathon 2026 (Problem Statement ID: 26207). It dynamically adapts a student's learning journey based on demonstrated mastery, completely rethinking the traditional fixed course structure.

## Core Innovations

1. **Student Intelligence Layer**: Tracks deep knowledge gaps, prerequisite readiness, and common misconceptions.
2. **Deterministic Adaptive Engine**: Uses assessment data and a prerequisite graph to recommend exactly what to learn next and, crucially, explains *why*.
3. **Socratic AI Tutor**: Uses Gemini to guide students through concepts without blindly giving them answers, ensuring human-in-the-loop education.

## Architecture

- **Frontend**: Next.js (App Router), React, Tailwind CSS, Zustand
- **Backend**: Node.js, Express.js, TypeScript, Mongoose
- **Database**: MongoDB (Local or Atlas)
- **AI Integration**: Google Gen AI SDK (Gemini)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017, or a MongoDB Atlas URI)
- A Gemini API Key

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` to `.env` and fill in your values (specifically `DATABASE_URL`, `JWT_SECRET`, and `AI_API_KEY`).
4. Seed the database with the SIH Demo Scenario:
   ```bash
   npx tsx src/utils/seed.ts
   ```
5. Start the backend:
   ```bash
   npm run dev (or npx tsx src/server.ts)
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

## SIH Demo Scenario

When you run the seed script, it populates the database with a "Demo Student" who is learning Python. 
The student is:
- Strong in **Variables** and **Conditions**
- Weak in **Loops** and **OOP**
- Developing in **Functions**

When you log in as `student@example.com` (password: `password123`), you will immediately see the deterministic Adaptive Engine recommending practice on **Loops** and explaining why (because of recent 48% accuracy and confusion around nested loops).

## Future Scope

The architecture is built to easily integrate **Multimodal Learning Analytics (MMLA)**. Future signals such as gaze, posture, and speech can be ingested into the `IntelligenceService` to further refine the `MasteryRecord` without requiring a rewrite of the core Adaptive Engine.
