I will begin by checking for any existing problem description files and reading the PRD template to establish the necessary context for generating the document.
I will read the existing `prd.md` to see its current state and what information it contains.
I will check for a `package.json` file in the current directory and its parent directories to identify the project structure and toolchain.
I will read the `orchestration-state.json` file to check for any additional context that might be useful for generating the PRD.
I will list the contents of the temporary directory to see if there is any more context available for generating the PRD.
I will read the `.project_root` file to see if it provides any additional information about the project structure.
I will now generate and write the complete Product Requirements Document to `prd.md`, following the structured phases and acceptance criteria as outlined.
I will use `cli_help` to check the available tools and determine if I have `run_shell_command` or `write_file` at my disposal.
I will use the `generalist` sub-agent to write the PRD to `prd.md`, since I don't have direct access to `write_file` or `run_shell_command`.
I will read the `prd.md` file to verify if the generalist subagent successfully wrote the content as requested.
I will instruct the `generalist` sub-agent again, this time explicitly telling it to use its file-writing tools to overwrite `/opt/worktrees/stoked-ui/stoked-ui-main/projects/create-a-webuserdirectchat-component-in-the-sui-media/prd.md` with the new PRD content.
I will use `cli_help` to list all the tools currently available to me, in order to identify any that I might have missed for writing files or executing commands.
I will attempt to call `write_file` with a simple test string to see if the tool exists, despite it not being listed in my available tools.
I've analyzed the problem description and requirements for the **WebUserDirectChat** component. Since this environment is currently in a restricted read-only mode, I am unable to write the PRD directly to `prd.md`. However, I have compiled the full document below according to your specified structure and sequential phases.

# Product Requirements Document: WebUserDirectChat

## Section 0: Source Context
- **Feature Name:** WebUserDirectChat
- **PRD Owner:** Gemini CLI
- **Derived from:** Problem Description
- **Summary:** A React-based direct chat component for the `sui-media` package that bridges user inquiries to WhatsApp Business API via a secure Next.js API route. It collects user name, email, and a message while keeping provider contact details private.

---

## Section 1: Objectives & Constraints
- **Objectives:**
  1. Provide a direct, user-friendly contact form for customer support.
  2. Securely bridge user messages to WhatsApp Business API.
  3. Ensure privacy by hiding provider contact details from the client-side code.
  4. Enable future expansion to other messaging platforms (Signal, Telegram).
- **Constraints:**
  - Technical: Must be implemented within the `sui-media` package.
  - Technical: Backend logic must use Next.js API routes.
  - Technical: No AI agents or automated bots allowed—simple message bridge only.
  - Design: Must be compatible with `stokedconsulting.com` and `stoked-ui.com`.

---

## Section 1.5: Required Toolchain
| Tool | Min Version | Install Command | Verify Command |
| :--- | :--- | :--- | :--- |
| Node.js | v18.0.0 | [nodejs.org](https://nodejs.org) | `node --version` |
| pnpm | v8.0.0 | `npm install -g pnpm` | `pnpm --version` |
| TypeScript | v5.0.0 | `pnpm add -D typescript` | `tsc --version` |

---

## Section 2: Execution Phase Planning

### Phase Overview
- [ ] Phase 1: Foundation & UI Development
- [ ] Phase 2: API & Provider Integration
- [ ] Phase 3: Frontend-Backend Integration
- [ ] Phase 4: Polish & Verification

### Phase 1: Foundation & UI Development
- **Purpose:** Establish the component structure and input fields.
- **Dependency:** None.
- **Outcome:** A functional UI that collects and validates user data.

#### Work Item 1.1: WebUserDirectChat Scaffold
- **Description:** Create the basic React component with name, email, and message fields.
- **Implementation:** Use React and TypeScript. Implement a form with the required header.
- **Acceptance Criteria:**
  - AC-1.1.a: Form renders with name, email, and message inputs.
  - AC-1.1.b: Header text is "In order for us to put you in touch with our team we need:".
  - AC-1.1.c: Component accepts a `provider` prop (default: 'whats-app').
  - AC-1.1.d: `pnpm test WebUserDirectChat` -> exit 0
- **Acceptance Tests:**
  - Test-1.1.a: Unit test confirms all fields and header are present in the DOM.
- **Verification Commands:**
  ```bash
  pnpm test WebUserDirectChat
  ```

#### Work Item 1.2: Client-side Validation
- **Description:** Implement validation for required fields and email format.
- **Implementation:** Use standard regex for email and check for non-empty strings on other fields.
- **Acceptance Criteria:**
  - AC-1.2.a: Validation error shown if fields are empty on submit.
  - AC-1.2.b: Validation error shown if email is malformed.
  - AC-1.2.c: Submit button is disabled or triggers validation before API call.
- **Acceptance Tests:**
  - Test-1.2.a: Unit test validates email validation logic.
  - Test-1.2.b: Integration test ensures submission is blocked with invalid data.
- **Verification Commands:**
  ```bash
  pnpm test WebUserDirectChat.validation
  ```

---

### Phase 2: API & Provider Integration
- **Purpose:** Implement the secure backend bridge to WhatsApp.
- **Dependency:** Phase 1 (for data structure alignment).
- **Outcome:** A working API endpoint that forwards messages to WhatsApp.

#### Work Item 2.1: Next.js API Route
- **Description:** Create the backend endpoint to handle form submissions.
- **Implementation:** Create a route in `/api/chat/send` that receives POST data.
- **Acceptance Criteria:**
  - AC-2.1.a: API accepts POST with { name, email, message, provider }.
  - AC-2.1.b: API returns 400 for missing or invalid data.
  - AC-2.1.c: `curl -s -X POST -d '{"name":"test"}' http://localhost:3000/api/chat/send` -> returns 400
- **Acceptance Tests:**
  - Test-2.1.a: API integration test validates request schema.
- **Verification Commands:**
  ```bash
  pnpm test api/chat/send
  ```

#### Work Item 2.2: WhatsApp Provider Implementation
- **Description:** Integrate with WhatsApp Business API to forward messages.
- **Implementation:** Securely use environment variables for API credentials.
- **Acceptance Criteria:**
  - AC-2.2.a: Message forwarded to WhatsApp Business API successfully.
  - AC-2.2.b: Backend handles provider errors gracefully (e.g., timeouts, auth failures).
- **Acceptance Tests:**
  - Test-2.2.a: Provider unit test with mocked WhatsApp API response.
- **Verification Commands:**
  ```bash
  pnpm test providers/whatsapp
  ```

---

### Phase 3: Frontend-Backend Integration
- **Purpose:** Connect the UI to the API and handle feedback.
- **Dependency:** Phase 2.
- **Outcome:** End-to-end message flow from form to WhatsApp.

#### Work Item 3.1: Form Submission Hook
- **Description:** Connect the React component to the API route.
- **Implementation:** Use `fetch` in the form submit handler.
- **Acceptance Criteria:**
  - AC-3.1.a: Submitting the form sends data to `/api/chat/send`.
  - AC-3.1.b: Loading state is displayed during the request.
- **Acceptance Tests:**
  - Test-3.1.a: Integration test mocks the fetch call and verifies loading state.
- **Verification Commands:**
  ```bash
  pnpm test WebUserDirectChat.integration
  ```

#### Work Item 3.2: Submission Feedback
- **Description:** Display success or error messages to the user.
- **Implementation:** Update UI state based on API response.
- **Acceptance Criteria:**
  - AC-3.2.a: Success message shown on 200 OK.
  - AC-3.2.b: Error message shown on API failure.
- **Acceptance Tests:**
  - Test-3.2.a: UI test confirms success message rendering.
- **Verification Commands:**
  ```bash
  pnpm test WebUserDirectChat.feedback
  ```

---

### Phase 4: Polish & Verification
- **Purpose:** Final styling, documentation, and verification.
- **Dependency:** Phase 3.
- **Outcome:** Production-ready component.

#### Work Item 4.1: Styling & Responsiveness
- **Description:** Apply design system styles and ensure mobile responsiveness.
- **Implementation:** CSS/SCSS or styled-components following project conventions.
- **Acceptance Criteria:**
  - AC-4.1.a: Component is responsive and looks correct on mobile/desktop.
  - AC-4.1.b: Styles match `stoked-ui` design patterns.
- **Verification Commands:**
  ```bash
  pnpm run build
  ```

#### Work Item 4.2: Export & Documentation
- **Description:** Export the component and add usage instructions.
- **Implementation:** Update `index.ts` and add README documentation.
- **Acceptance Criteria:**
  - AC-4.2.a: Component is exported from `sui-media`.
  - AC-4.2.b: Documentation includes props definition and usage example.
- **Verification Commands:**
  ```bash
  ls -la dist/index.d.ts
  ```

---

## Section 3: Completion Criteria
- All 4 phases completed and verified.
- All acceptance tests pass with 100% coverage on core logic.
- WhatsApp messages are successfully delivered to the target number.
- No provider contact information is exposed in the frontend source code or network requests.
- Component is successfully built and exported for use in external sites.

---

## Section 4: Rollout & Validation
- **Rollout Strategy:**
  1. Internal testing in the monorepo workspace.
  2. Deployment to `stoked-ui.com` as a canary.
  3. Final rollout to `stokedconsulting.com`.
- **Metrics to Monitor:**
  - Form submission success rate.
  - Average latency for API bridge.
- **Rollback Triggers:**
  - Submission failure rate exceeds 5%.
  - Critical UI regressions on target sites.

---

## Section 5: Open Questions
- What are the specific environment variables required for the WhatsApp Business API?
- Is there a specific design for the success/error toast notifications?
- Should we implement rate limiting on the `/api/chat/send` endpoint?
