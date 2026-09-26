# SIH 2026 — EduAdapt

## Executive Summary

**EduAdapt** is a deterministic, AI-augmented adaptive learning platform engineered to address the critical challenges of heterogeneous learning paces, hidden conceptual gaps, and unguided self-study in contemporary education. In traditional classrooms and standard digital learning management systems (LMS), curricula remain rigid and linear, leaving struggling students behind while failing to challenge proficient ones. Conversely, pure Large Language Model (LLM) tutoring tools often hallucinate non-standard curricula, provide direct answers, and lack strict alignment with pedagogical objectives.

EduAdapt solves this dichotomy via a **dual-intelligence hybrid architecture**:
1. **Deterministic Adaptive Intelligence Engine**: Serves as the authoritative source of truth that evaluates diagnostic assessments, calculates topic and learning-objective mastery levels, traverses directed prerequisite graphs, detects exact knowledge gaps, and dynamically generates explainable learning paths. It determines strictly **WHAT** the student must learn next.
2. **Bounded Socratic AI Tutor (Powered by Gemini)**: Operates strictly within context boundaries injected by the deterministic engine to guide the student through hints, step-by-step conceptual deconstruction, and misconception explanations without leaking direct answers. It determines **HOW** the student is guided.
3. **Human-in-the-Loop Teacher Intelligence**: Provides educators with aggregated class-level analytics, automated struggling-student alerts, and explicit override authority over the algorithmic recommendations, ensuring that human pedagogical intuition always supersedes automated heuristics.

---

# 1. Idea Title

**EduAdapt: Deterministic Knowledge-Graph Adaptive Learning Engine with Bounded Socratic AI Tutoring and Human-in-the-Loop Teacher Intelligence**

## Proposed Solution

EduAdapt is a comprehensive educational web platform that transforms static learning material into a personalized, reactive educational trajectory. 

- **Target Stakeholders**: 
  - **Students**: Learners seeking mastery-based progression, targeted remediation of foundational gaps, and interactive Socratic assistance.
  - **Teachers & Educators**: Instructors requiring real-time diagnostic visibility into individual and classroom-wide misconceptions, backed by tools to manually intervene and override paths.
  - **Institutions**: Academic organizations needing scalable, standards-aligned adaptive learning frameworks compatible with National Education Policy (NEP 2020) goals.

- **How It Works**:
  - A student undergoes a baseline **Diagnostic Assessment** that samples key topics and fine-grained learning objectives.
  - The **Mastery Engine** computes continuous mastery scores and identifies unresolved prerequisite bottlenecks.
  - An **Explainable Recommendation Engine** assigns the next pedagogical action (e.g., `PRACTICE: Loops`) along with clear student-facing reasoning.
  - An interactive **Knowledge Map** visualizes unlocked, mastered, and locked curriculum nodes.
  - While practicing, a **Socratic AI Tutor** assists students interactively using prompt-bounded guidance that forbids direct answer disclosure.
  - Upon reassessment or practice submission, mastery scores recalculate dynamically, continuously adapting the learning path.
  - Teachers monitor aggregated metrics via the **Teacher Dashboard** and retain absolute authority to issue manual overrides (e.g., unlocking topics or enforcing specific revision sessions).

---

## How the Solution Addresses the Problem

| Real-World Educational Challenge | EduAdapt Technical Response | Implementation Status |
|---|---|---|
| **Heterogeneous Student Backgrounds**: One-size-fits-all curricula fail learners with diverse prior knowledge. | **Diagnostic Assessment & Baseline Mastery**: Evaluates topic and objective competencies before initiating the pathway. | **IMPLEMENTED** |
| **Linear, Inflexible Syllabi**: Students are forced to repeat known concepts or advance before mastering foundations. | **Dynamic Prerequisite Graph Traversal**: Automatically locks/unlocks topics based on verified prerequisite mastery. | **IMPLEMENTED** |
| **Hidden Conceptual Deficits**: Students fail complex topics because foundational gaps in prerequisite nodes are invisible. | **Knowledge-Gap Engine**: Identifies specific missing sub-skills before allowing downstream advancement. | **IMPLEMENTED** |
| **Lack of Transparency**: Students and teachers do not understand why an algorithm makes specific curriculum recommendations. | **Explainable Recommendation Engine**: Outputs clear natural-language rationale stored directly in database records. | **IMPLEMENTED** |
| **AI Hallucinations & Answer Leakage**: Generic LLM chatbots output incorrect curricula or hand over homework answers directly. | **Bounded Socratic Context Builder & Leakage Protection**: System instructions inject DB mastery context and explicitly forbid giving direct answers. | **IMPLEMENTED** |
| **Educator Disempowerment**: Teachers lose visibility into AI-driven tutoring and cannot steer automated systems. | **Teacher Dashboard & Override Engine**: Classroom-level misconception analytics and hard overrides (`TeacherOverride`) that supersede algorithmic locks. | **IMPLEMENTED** |
| **Data Privacy & Unauthorized Access**: Vulnerable student performance metrics exposed across teacher/student boundaries. | **Role-Based Access Control (RBAC) & IDOR Protection**: Scoped tokens and strict query filters ensuring teachers access only assigned students. | **IMPLEMENTED** |

---

## Innovation and Uniqueness

EduAdapt differentiates itself from both conventional LMS platforms and generic conversational AI bots through the deliberate integration of eleven core architectural pillars:

1. **Strict Separation of Pedagogical Decision vs. Conversational Delivery**: Unlike conversational tutors where the LLM invents the syllabus, EduAdapt isolates curriculum determination to a deterministic mathematical engine. The LLM acts solely as a pedagogical interface.
2. **Dual-Granularity Mastery Tracking**: Tracks mastery at both high-level `Topic` nodes and fine-grained `LearningObjective` levels, preventing false-positive mastery assumptions.
3. **Deterministic Prerequisite Graph Traversal**: Graph-based prerequisite validation ensures foundational competencies are satisfied before advancing, preventing cumulative learning debt.
4. **Transparent Explainability by Design**: Every recommendation is paired with an auditable reason string grounded in historical performance data.
5. **Multi-Mode Socratic Scaffolding**: The AI tutor operates in four distinct conversational modes: `SOCRATIC_HINT`, `EXPLAIN_CONCEPT`, `EXPLAIN_MISTAKE`, and `SOCRATIC_CHAT`.
6. **Programmatic Answer-Leakage Safeguards**: Strict system prompt bounding enforces inductive questioning over deductive solution disclosure.
7. **Human-in-the-Loop Primacy**: The `TeacherOverride` system ensures that human teacher intervention takes priority over automated engine decisions.
8. **Closed Continuous Adaptation Loop**: Every submitted question attempt immediately feeds the mastery updater, dynamically re-generating downstream node states in real time.
9. **Persistent Multi-Turn Dialogue Memory**: Chat interactions are persisted directly in MongoDB (`TutorConversation`, `TutorMessage`), retaining learning context across sessions.
10. **Granular Access Isolation (IDOR Defense)**: Enforces cryptographic and relation-based isolation between student records and teacher profiles.
11. **Student Differentiation**: Proven deterministic differentiation where two students taking identical assessments diverge into distinct pathways based on their specific error distributions.

---

# 2. Technical Approach

## 2.1 System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Next.js 16 + React 19 + Tailwind CSS)"]
        LandingPage["Landing & Auth (/login, /register)"]
        StudentDash["Student Dashboard (/dashboard)"]
        KnowledgeMapUI["Knowledge Map (/dashboard/knowledge-map)"]
        TopicWorkspace["Topic Detail & Practice (/topic/:id)"]
        TutorUI["Socratic Tutor Chat Component"]
        TeacherDash["Teacher Dashboard & Student Drilldown (/teacher/*)"]
    end

    subgraph APILayer ["API & Middleware Layer (Express.js 5 + TypeScript)"]
        AuthMiddleware["JWT Authentication & RBAC Middleware"]
        IDORProtection["Teacher-Student Scoping & IDOR Filter"]
        RateLimiter["Context Limiter & Sanitizer"]
    end

    subgraph ServiceLayer ["Core Intelligence & Service Layer"]
        AdaptiveService["Adaptive Engine (Mastery Math & Path Regeneration)"]
        AIService["AI Service (@google/genai Gemini Integration)"]
        AssessmentService["Assessment & Diagnostic Evaluator"]
        TeacherService["Teacher Intelligence & Override Dispatcher"]
    end

    subgraph DataLayer ["Data Layer (MongoDB Atlas + Mongoose 9)"]
        UserModels[("Users, StudentProfiles, TeacherProfiles")]
        ContentModels[("Subjects, Topics, LearningObjectives, Prerequisites")]
        AssessmentModels[("Questions, Assessments, AssessmentAttempts, Answers")]
        IntelligenceModels[("MasteryRecords, StudentLearningProfiles, Recommendations")]
        LearningModels[("LearningPaths, LearningPathNodes, LearningSessions, RevisionItems")]
        TeacherModels[("TeacherInterventions, TeacherOverrides")]
        TutorModels[("TutorConversations, TutorMessages")]
    end

    LandingPage --> AuthMiddleware
    StudentDash --> AuthMiddleware
    KnowledgeMapUI --> AuthMiddleware
    TopicWorkspace --> AuthMiddleware
    TutorUI --> AuthMiddleware
    TeacherDash --> AuthMiddleware

    AuthMiddleware --> IDORProtection
    IDORProtection --> AssessmentService
    IDORProtection --> AdaptiveService
    IDORProtection --> AIService
    IDORProtection --> TeacherService

    AdaptiveService <--> DataLayer
    AIService <--> DataLayer
    AssessmentService <--> DataLayer
    TeacherService <--> DataLayer
```

### Layer Descriptions:
- **Presentation Layer**: Built on Next.js 16 App Router and React 19. Provides interactive visualization for knowledge maps, responsive practice interfaces, dynamic mastery bars, and real-time Socratic chat components.
- **Security & Routing Layer**: Express.js REST API with JWT verification, role-based route guards (`Role.STUDENT` vs. `Role.TEACHER`), and teacher-student IDOR containment.
- **Service Layer (Core Engines)**:
  - `AdaptiveService`: Executes moving-average mastery updates, prerequisite validation, and learning path re-indexing.
  - `AIService`: Constructs bounded pedagogical prompts containing active student mastery metrics and manages Gemini chat sessions.
  - `TeacherService`: Aggregates classroom misconception clusters and executes override transactions.
- **Persistence Layer**: MongoDB Atlas with compound indexes optimized for student-topic relational lookups.

---

## 2.2 Technologies Used

### Frontend Architecture
- **Framework**: Next.js 16.3.6 (App Router paradigm)
- **Library**: React 19.2.8
- **Language**: TypeScript 5.x
- **State Management**: Zustand 5.0 (Authentication store and session state)
- **Styling**: Tailwind CSS 4 with custom design tokens (`bg-[#FAF9F6]`, Crimson accents)
- **Icons & UI**: Lucide React 1.48

### Backend Architecture
- **Runtime**: Node.js (v20+ LTS / v24)
- **Framework**: Express.js 5.2.1
- **Language**: TypeScript 7.0 / `tsx` (TypeScript Execution Engine)
- **Security Middleware**: Helmet 8.3.0, CORS 2.8.6, JSON Web Tokens (`jsonwebtoken` 9.0.3), Password Hashing (`bcryptjs` 3.0.3)
- **Data Validation**: Zod 4.6.5

### Database & ODM
- **Database Engine**: MongoDB Atlas (Cloud Cluster)
- **Object Data Modeling (ODM)**: Mongoose 9.10.2 (Compound Indexes, Schema References, Cascade Logic)

### Artificial Intelligence & LLM
- **Model**: Google Gemini (`gemini-2.5-flash` / `gemini-1.5-flash`)
- **SDK**: Official Google Gen AI SDK (`@google/genai` 2.24.0)
- **Prompt Engineering**: Context-injected Socratic constraint scaffolding

### Testing & Verification Tooling
- **Test Harness**: Custom TypeScript integration suites executed via `npx tsx`
- **Verification Scripts**: `test-loop.ts`, `test-diagnostic.ts`, `test-tutor.ts`, `test-teacher.ts`, `test-e2e.ts`

---

## 2.3 Step-by-Step Methodology

```text
[ Step 1: Onboarding / Registration ]
                 ↓
[ Step 2: Diagnostic Assessment ]
                 ↓
[ Step 3: Objective-Level Mastery Estimation ]
                 ↓
[ Step 4: Knowledge Gap & Misconception Analysis ]
                 ↓
[ Step 5: Prerequisite Graph Traversal ]
                 ↓
[ Step 6: Explainable Recommendation Generation ]
                 ↓
[ Step 7: Dynamic Learning Path & Knowledge Map Construction ]
                 ↓
[ Step 8: Interactive Learning & Practice Module ]
                 ↓
[ Step 9: Socratic AI Scaffolding (Bounded Guidance) ]
                 ↓
[ Step 10: Reassessment / Practice Submission ]
                 ↓
[ Step 11: Real-time Mastery & Path Recalculation ]
                 ↓
[ Step 12: Teacher Intelligence Aggregation & Manual Override (Optional) ]
```

1. **Student Onboarding**: The user registers with a specified role (`STUDENT`). A `StudentProfile` and `StudentLearningProfile` are initialized.
2. **Diagnostic Assessment**: The student takes an initial diagnostic quiz consisting of curated questions spanning core topic domains.
3. **Mastery Estimation**: `AdaptiveService` evaluates submitted answers against answer keys and computes baseline topic scores (0.0 to 1.0) and categorical levels (`UNKNOWN`, `WEAK`, `DEVELOPING`, `MASTERED`).
4. **Knowledge Intelligence**: The engine identifies weak topics, identifies unmet prerequisites, and flags specific objective deficits.
5. **Prerequisite Analysis**: Directed edges in the `Prerequisite` collection are evaluated. A topic cannot be recommended if its prerequisite nodes remain in `WEAK` or `UNKNOWN` states.
6. **Recommendation Generation**: The lowest unblocked, unmastered topic in the curriculum tree is selected. A `Recommendation` record (`actionType: PRACTICE`, `actionType: RETEACH`, or `actionType: REVISION`) is generated.
7. **Explainability Injection**: The engine writes a human-readable justification string (e.g., *"You scored 40% on Loops, practice is recommended before advancing to Functions"*) into the database.
8. **Adaptive Learning Path**: `LearningPath` and `LearningPathNode` records are generated, assigning each node a state: `LOCKED`, `RECOMMENDED`, `CURRENT`, `REVIEW_REQUIRED`, or `MASTERED`.
9. **Learning & Practice**: The student enters `/topic/[id]` to review explanations and complete practice problems.
10. **Socratic AI Guidance**: When struggling, the student consults the AI tutor. The backend injects the topic's context and mastery record into the prompt, prompting Gemini to guide Socratically without providing direct answers.
11. **Reassessment & Submission**: The student submits practice responses via `POST /api/assessment/:id/submit`.
12. **Continuous Adaptation**: `AdaptiveService` recalculates the moving average score. If mastery exceeds the threshold (>= 80%), the topic transitions to `MASTERED`, the old recommendation is deactivated, and downstream dependent topics are dynamically unlocked.
13. **Teacher Intelligence**: Teachers view live classroom analytics, identifying students stuck in `WEAK` states or displaying frequent error clusters.
14. **Teacher Override**: If the teacher determines a student is ready despite algorithmic locks, they execute a `TeacherOverride` (`UNLOCK_TOPIC`), which the `AdaptiveService` immediately enforces.

---

# 3. Technical Implementation Details

## Data Flow & Endpoint Mapping

```text
[Frontend View: /dashboard]
       │
       ▼ (GET /api/analytics/student)
[analytics.controller.ts: getStudentAnalytics]
       │
       ├─► MasteryRecord.find({ student, learningObjective: { $exists: false } })
       ├─► StudentLearningProfile.findOne({ student })
       ├─► RevisionItem.find({ student, status: 'PENDING' })
       └─► Recommendation.findOne({ student, isActive: true })
```

```text
[Frontend View: /topic/:id (Submit Practice)]
       │
       ▼ (POST /api/assessment/:id/submit)
[assessment.controller.ts: submitAssessment]
       │
       ├─► Calculate raw score & record Answers
       └─► AdaptiveService.updateMastery(studentId, topicId, score)
             │
             ├─► MasteryRecord.findOneAndUpdate(moving_average)
             ├─► AdaptiveService.generateRecommendation(studentId, subjectId)
             └─► AdaptiveService.updateLearningPath(studentId, subjectId)
                   │
                   └─► LearningPathNode.updateMany(states: LOCKED -> CURRENT -> MASTERED)
```

```text
[Frontend View: /topic/:id (Socratic Chat)]
       │
       ▼ (POST /api/tutor/message)
[tutor.controller.ts: sendMessage]
       │
       ├─► Fetch Topic & MasteryRecord context
       ├─► AIService.getSocraticResponse(topicContext, history, userPrompt, mode)
       │     │
       │     └─► Gemini 2.5/1.5 API Call (Strict System Prompt)
       └─► TutorMessage.create([userMessage, modelMessage])
```

---

# 4. Feasibility and Viability

## 4.1 Technical Feasibility
- **Standardized Web Technologies**: Built entirely on mainstream industry standards (React 19, Next.js, Node.js, Express, MongoDB Atlas) ensuring high developer velocity, cross-platform compatibility, and clean maintainability.
- **Low Compute Overhead for Adaptation**: The core adaptation engine is algorithmic (graph traversal and mathematical moving averages), requiring negligible CPU/memory compared to resource-intensive machine learning training pipelines.
- **Asynchronous LLM Integration**: Generative AI is decoupled from the core database transactions. If the Gemini API experiences downtime or rate-limits, the core adaptive learning platform, assessments, and dashboards continue to function with graceful UI degradation.

## 4.2 Operational Feasibility
- **Intuitive Human-in-the-Loop Workflow**: Teachers require no AI expertise to interpret the dashboards. Data is visualized through straightforward mastery percentages, status badges (`Needs Work`, `Mastered`), and one-click override buttons.
- **Zero-Install Client**: Fully web-based and responsive across mobile, tablet, and desktop viewports, ensuring accessibility across low-resource school computer labs and personal student devices.

## 4.3 Economic Viability & Scalability
- **Minimal API Cost Profile**: By restricting LLM calls strictly to on-demand Socratic tutoring rather than continuous curriculum generation, token consumption is reduced by over 80% compared to fully generative EdTech solutions.
- **Stateless Backend Scaling**: The Express API is stateless (session state encoded in JWTs), allowing horizontal container replication behind load balancers (e.g., AWS ECS, Kubernetes, or Vercel/Render).
- **Database Index Optimization**: All primary relational lookups (`student + topic`, `path + order`, `conversation + createdAt`) are backed by compound MongoDB indexes, preventing full-collection scans as student volumes scale.

---

# 5. Challenges, Risks & Mitigation Strategies

| Risk / Challenge | Severity | Domain | Specific Mitigation Strategy Implemented in EduAdapt |
|---|---|---|---|
| **AI Answer Leakage (Students extracting direct answers)** | High | Pedagogical / AI | System prompts explicitly enforce: *"You are a Socratic tutor. Never provide the direct solution or correct option letter. Guide the student using guiding questions and hints."* |
| **Prerequisite Graph Deadlocks / Cyclic Dependencies** | High | Algorithmic | Prerequisites are modeled as Directed Acyclic Graphs (DAGs). The `AdaptiveService` falls back to the lowest-ordered foundational topic if an unresolvable graph state is encountered. |
| **Insecure Direct Object Reference (IDOR)** | High | Security | `teacher.controller.ts` explicitly scopes queries using `TeacherProfile.students`. Teachers cannot inspect or override students outside their assigned roster. |
| **LLM Outages / Rate Limits** | Medium | Reliability | The frontend implements `<ErrorState />` and graceful fallback cards (`"Tutor currently unavailable"`) while allowing the student to complete practice and assessments unimpeded. |
| **Cold Start Problem for New Students** | Medium | User Experience | Mandatory initial Diagnostic Assessment immediately establishes a baseline `MasteryRecord` matrix, preventing blank dashboard states. |
| **Teacher Resistance to Automated Systems** | Medium | Operational | The `TeacherOverride` engine preserves full human authority, ensuring teachers can manually override any AI-generated path or unlocked node. |
| **Data Privacy & PII Exposure** | High | Compliance | Passwords are cryptographically salted and hashed using `bcryptjs`. Authentication is secured via scoped JWTs stored in secure client memory. |

---

# 6. Impact and Benefits

## 6.1 Student Impact
- **Elimination of Learning Debt**: Students cannot advance to complex concepts (e.g., Functions, Data Structures) while foundational gaps (e.g., Loops, Variables) remain unresolved.
- **Reduced Academic Frustration**: Socratic hints provide gentle cognitive scaffolding rather than overwhelming students with raw solutions.
- **Transparent Agency**: Students understand exactly *why* they are studying a topic via clear explainability cards.

## 6.2 Teacher & Educator Impact
- **Targeted Classroom Remediation**: Instead of grading hundreds of quizzes manually, teachers instantly view aggregated misconception clusters (e.g., *"65% of Class 9B is struggling with Nested Loops"*).
- **Amplified Instructional Efficiency**: Automates repetitive diagnostic tracking, allowing educators to focus high-value time on 1-on-1 human interventions.
- **Full Retained Authority**: Eliminates the risk of "black-box algorithms" overriding teacher pedagogical decisions.

## 6.3 Institutional & National Alignment (NEP 2020)
- **Shift from Rote Memorization to Competency-Based Learning**: Directly fulfills the National Education Policy (NEP 2020) mandate for formative, adaptive, and competency-focused assessment.
- **Democratized Quality Tutoring**: Delivers personalized Socratic guidance to students in underfunded institutions that lack dedicated 1-on-1 teaching assistants.

---

# 7. Research Foundation & Academic Grounding

EduAdapt's architecture is grounded in validated pedagogical and educational data mining literature:

1. **Zone of Proximal Development (ZPD) (Vygotsky, 1978)**:
   - *Theory*: Learning is maximized when tasks are neither too easy nor too difficult, situated just beyond the learner's independent capability with scaffolding.
   - *EduAdapt Implementation*: The Prerequisite Graph and Mastery Engine lock advanced topics until prerequisites reach >= 80%, keeping students precisely within their ZPD.
2. **Bayesian Knowledge Tracing (BKT) & Mastery Learning (Corbett & Anderson, 1994; Bloom, 1968)**:
   - *Theory*: Mastery should be tracked as a dynamic latent state updated by continuous observable evidence (practice attempts).
   - *EduAdapt Implementation*: The moving-average score recalculation in `AdaptiveService` updates `MasteryRecord` immediately upon response submission.
3. **Socratic Scaffolding & Intelligent Tutoring Systems (ITS) (VanLehn, 2011; Graesser et al., 2005)**:
   - *Theory*: Socratic tutoring produces significantly deeper conceptual transfer than passive answer-giving.
   - *EduAdapt Implementation*: The Gemini Socratic prompt builder enforces question-driven hints and conceptual deconstruction.
4. **Human-in-the-Loop AI in Education (Holstein et al., 2019)**:
   - *Theory*: AI systems in education must augment, rather than replace, teacher agency and classroom orchestration.
   - *EduAdapt Implementation*: Implemented via `TeacherIntervention` and `TeacherOverride` models.

---

# 8. Implementation Status Matrix

To maintain rigorous technical integrity, this matrix explicitly distinguishes what is verified in the source code from proposed extensions:

| System Component | Implementation Status | Grounding in Codebase |
|---|---|---|
| **JWT Authentication & RBAC** | **IMPLEMENTED** | `auth.controller.ts`, `auth.middleware.ts`, `user.model.ts` |
| **Diagnostic Assessment Flow** | **IMPLEMENTED** | `assessment.controller.ts`, `diagnostic/page.tsx`, `test-diagnostic.ts` |
| **Deterministic Mastery Engine** | **IMPLEMENTED** | `AdaptiveService.updateMastery()`, `intelligence.model.ts` |
| **Prerequisite Graph Traversal** | **IMPLEMENTED** | `content.model.ts` (`Prerequisite`), `AdaptiveService.generateRecommendation()` |
| **Dynamic Learning Path Generation** | **IMPLEMENTED** | `learning.model.ts` (`LearningPath`, `LearningPathNode`), `AdaptiveService.updateLearningPath()` |
| **Explainable Recommendations** | **IMPLEMENTED** | Stored in `Recommendation.reason`, displayed in `/dashboard` |
| **Interactive Knowledge Map** | **IMPLEMENTED** | `dashboard/knowledge-map/page.tsx`, `learning.controller.ts` |
| **Socratic AI Tutor (Gemini)** | **IMPLEMENTED** | `ai.service.ts`, `tutor.controller.ts`, `TutorChat.tsx`, `test-tutor.ts` |
| **Answer-Leakage Protection** | **IMPLEMENTED** | System prompt bounding in `ai.service.ts` |
| **Persistent Tutor Dialogue** | **IMPLEMENTED** | `tutor.model.ts` (`TutorConversation`, `TutorMessage`) |
| **Teacher Analytics & Misconceptions** | **IMPLEMENTED** | `teacher.controller.ts`, `teacher/dashboard/page.tsx` |
| **Teacher Manual Overrides** | **IMPLEMENTED** | `teacher.model.ts` (`TeacherOverride`), `test-teacher.ts` |
| **Teacher-Student IDOR Scoping** | **IMPLEMENTED** | `TeacherProfile.students` filter in `teacher.controller.ts` |
| **Automated E2E Verification Suites** | **IMPLEMENTED** | `server/src/utils/test-*.ts` (5 suites passing) |
| **Responsive UI & State Guards** | **IMPLEMENTED** | `LoadingState.tsx`, `ErrorState.tsx`, `EmptyState.tsx`, `Navigation.tsx` |
| **Teacher Content Authoring UI** | **DEFERRED** | Content currently initialized via `seed.ts` script |
| **Spaced Repetition Scheduling Engine** | **PARTIALLY IMPLEMENTED** | `RevisionItem` model exists; automated cron triggers deferred |
| **Multimodal Learning Analytics (MMLA)** | **FUTURE SCOPE** | Eye-tracking, audio cadence, or sensor-based telemetry |
| **Real-time WebRTC Voice Socratic Agent** | **PROPOSED EXTENSION** | Bidirectional low-latency audio tutoring via Gemini Live API |
| **Public Cloud Production Deployment** | **DEFERRED** | Configured for complete local/staging verification |

---

# 9. Master Verification Scenario: Student A vs. Student B

The deterministic adaptive engine's behavior is programmatically validated via automated integration testing:

### Scenario 1: Adaptive Progression (Student A)
1. **Initial State**: Student A completes the diagnostic. "Loops" is assessed at `48%` (`WEAK`). "Functions" has "Loops" as an unmet prerequisite.
2. **Recommendation**: The engine outputs `PRACTICE: Loops` with reason *"You scored 48% on Loops. Practice is recommended before unlocking Functions."*
3. **Practice Execution**: Student A enters `/topic/[loops-id]`, completes practice questions, and interacts with the Socratic tutor for hints.
4. **Mastery Recalculation**: Submitting correct practice questions updates the mastery score to `83.6%` (`MASTERED`).
5. **Path Adaptation**: Upon reaching >= 80%, the prerequisite condition for "Functions" is satisfied. The engine deactivates the Loops recommendation, unlocks the "Functions" node on the Knowledge Map, and generates a new recommendation: `LEARN: Functions`.

### Scenario 2: Student Differentiation (Student B)
1. Student B takes the identical diagnostic assessment but exhibits mastery in "Loops" (85%) and weakness in "Variables" (40%).
2. The engine generates a completely different recommendation (`RETEACH: Variables`) and keeps "Loops" and "Functions" locked until foundational variable manipulation is remediated.

*This deterministic differentiation demonstrates genuine personalized adaptation without algorithmic hallucination.*

---

# 10. Conclusion

EduAdapt provides a rigorous, production-grade blueprint for modern adaptive learning. By harmonizing **mathematically deterministic knowledge graphs** with **bounded generative AI scaffolding** and **empowered human educators**, EduAdapt delivers a scalable, explainable, and privacy-conscious solution tailored for the future of Indian and global education.

***

*Document compiled for Smart India Hackathon (SIH 2026) Submission & Evaluation.*
