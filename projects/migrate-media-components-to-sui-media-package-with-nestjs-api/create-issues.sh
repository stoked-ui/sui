#!/bin/bash

# Store issue numbers
declare -A MASTER_ISSUES
declare -A WORK_ITEMS

# Project details
PROJECT_NUM=9
OWNER="stoked-ui"
REPO="sui"
SLUG="migrate-media-components-to-sui-media-package-with-nestjs-api"

# Phase 1 Master (already created)
MASTER_ISSUES[1]=185

# Phase 2 Master
ISSUE_URL=$(cat <<'EOF' | gh issue create --repo "$OWNER/$REPO" --title "(Phase 2) - Component Migration from v3 - MASTER" --body-file -
## Phase 2: Component Migration from v3

**Purpose:** Migrate MediaCard, MediaViewer, and all their composed components from the v3 codebase to @stoked-ui/media. This phase requires Phase 1's foundation and creates the React components that Phase 3's API will support.

**Part of Project:** Migrate Media Components to sui-media Package with NestJS API

**Related Documents:**
- Product Feature Brief: `./projects/migrate-media-components-to-sui-media-package-with-nestjs-api/pfb.md`
- Product Requirements Document: `./projects/migrate-media-components-to-sui-media-package-with-nestjs-api/prd.md` (Section: Phase 2)

**Work Items in this Phase:**
- [ ] 2.1 Analyze and Document v3 Component Dependencies
- [ ] 2.2 Create Abstraction Layer for External Dependencies
- [ ] 2.3 Migrate MediaCard Component and Dependencies
- [ ] 2.4 Migrate MediaViewer Component and Sub-Components
- [ ] 2.5 Create Component Documentation and Storybook Stories

**Completion Criteria:**
All work items in this phase must be complete before moving to Phase 3.

---

This is a MASTER issue for Phase 2. See child issues for specific work items.
EOF
)
ISSUE_NUM=$(echo "$ISSUE_URL" | grep -oE '[0-9]+$')
gh project item-add $PROJECT_NUM --owner "$OWNER" --url "$ISSUE_URL"
MASTER_ISSUES[2]=$ISSUE_NUM
echo "Phase 2 Master: #$ISSUE_NUM"

# Phase 3 Master
ISSUE_URL=$(cat <<'EOF' | gh issue create --repo "$OWNER/$REPO" --title "(Phase 3) - Backend API Development - MASTER" --body-file -
## Phase 3: Backend API Development

**Purpose:** Create the @stoked-ui/media-api NestJS package with all media endpoints and server-side processing capabilities. This phase provides the backend infrastructure that Phase 4 will integrate with the frontend.

**Part of Project:** Migrate Media Components to sui-media Package with NestJS API

**Related Documents:**
- Product Feature Brief: `./projects/migrate-media-components-to-sui-media-package-with-nestjs-api/pfb.md`
- Product Requirements Document: `./projects/migrate-media-components-to-sui-media-package-with-nestjs-api/prd.md` (Section: Phase 3)

**Work Items in this Phase:**
- [ ] 3.1 Implement Core Media Module and Entities
- [ ] 3.2 Implement File Upload and Storage Service
- [ ] 3.3 Implement Server-Side Metadata Extraction
- [ ] 3.4 Implement Thumbnail Generation Service
- [ ] 3.5 Implement Media CRUD and Query Endpoints

**Completion Criteria:**
All work items in this phase must be complete before moving to Phase 4.

---

This is a MASTER issue for Phase 3. See child issues for specific work items.
EOF
)
ISSUE_NUM=$(echo "$ISSUE_URL" | grep -oE '[0-9]+$')
gh project item-add $PROJECT_NUM --owner "$OWNER" --url "$ISSUE_URL"
MASTER_ISSUES[3]=$ISSUE_NUM
echo "Phase 3 Master: #$ISSUE_NUM"

# Phase 4 Master
ISSUE_URL=$(cat <<'EOF' | gh issue create --repo "$OWNER/$REPO" --title "(Phase 4) - Integration & Testing - MASTER" --body-file -
## Phase 4: Integration & Testing

**Purpose:** Connect the frontend components to the backend API, create migration tooling, and ensure comprehensive testing. This phase integrates the work from Phases 1-3 into a cohesive system.

**Part of Project:** Migrate Media Components to sui-media Package with NestJS API

**Related Documents:**
- Product Feature Brief: `./projects/migrate-media-components-to-sui-media-package-with-nestjs-api/pfb.md`
- Product Requirements Document: `./projects/migrate-media-components-to-sui-media-package-with-nestjs-api/prd.md` (Section: Phase 4)

**Work Items in this Phase:**
- [ ] 4.1 Create API Client for Frontend Integration
- [ ] 4.2 Integrate MediaCard and MediaViewer with API
- [ ] 4.3 Create Migration Tooling and Scripts
- [ ] 4.4 Comprehensive Testing and Quality Assurance
- [ ] 4.5 Performance Optimization and Benchmarking

**Completion Criteria:**
All work items in this phase must be complete before moving to Phase 5.

---

This is a MASTER issue for Phase 4. See child issues for specific work items.
EOF
)
ISSUE_NUM=$(echo "$ISSUE_URL" | grep -oE '[0-9]+$')
gh project item-add $PROJECT_NUM --owner "$OWNER" --url "$ISSUE_URL"
MASTER_ISSUES[4]=$ISSUE_NUM
echo "Phase 4 Master: #$ISSUE_NUM"

# Phase 5 Master
ISSUE_URL=$(cat <<'EOF' | gh issue create --repo "$OWNER/$REPO" --title "(Phase 5) - Documentation & Release - MASTER" --body-file -
## Phase 5: Documentation & Release

**Purpose:** Complete all documentation, create migration guides, prepare packages for release, and establish deployment procedures. This phase makes the project production-ready.

**Part of Project:** Migrate Media Components to sui-media Package with NestJS API

**Related Documents:**
- Product Feature Brief: `./projects/migrate-media-components-to-sui-media-package-with-nestjs-api/pfb.md`
- Product Requirements Document: `./projects/migrate-media-components-to-sui-media-package-with-nestjs-api/prd.md` (Section: Phase 5)

**Work Items in this Phase:**
- [ ] 5.1 Create Package Documentation
- [ ] 5.2 Create Migration Guide and Documentation
- [ ] 5.3 Create API Documentation with OpenAPI/Swagger
- [ ] 5.4 Prepare Packages for Release
- [ ] 5.5 Create Deployment Guide for Media API

**Completion Criteria:**
All work items in this phase must be complete for project completion.

---

This is a MASTER issue for Phase 5. See child issues for specific work items.
EOF
)
ISSUE_NUM=$(echo "$ISSUE_URL" | grep -oE '[0-9]+$')
gh project item-add $PROJECT_NUM --owner "$OWNER" --url "$ISSUE_URL"
MASTER_ISSUES[5]=$ISSUE_NUM
echo "Phase 5 Master: #$ISSUE_NUM"

echo "Master issues created successfully!"
echo "Phase 1: #${MASTER_ISSUES[1]}"
echo "Phase 2: #${MASTER_ISSUES[2]}"
echo "Phase 3: #${MASTER_ISSUES[3]}"
echo "Phase 4: #${MASTER_ISSUES[4]}"
echo "Phase 5: #${MASTER_ISSUES[5]}"
