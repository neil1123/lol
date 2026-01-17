# Doord - Property Management Application

## Original Problem Statement
Build a full-stack application for Property Managers, Tenants, and Service Providers. Core workflow:
1. Tenant reports an issue
2. Property manager reviews and forwards to a service provider
3. Service provider provides quote and completes work
4. PM schedules service and tracks completion

## Key Features Implemented

### Core Features (Completed)
1. **User Roles & Authentication**: Separate dashboards for Tenants, Property Managers, and Service Providers
2. **PM Code System**: Tenants link to PM using unique 6-character code
3. **AI-Powered Issue Reporting**: Simple prompt → AI summary → structured form
4. **Quick Send to Provider**: One-click sending of issues to service providers
5. **PM Favorites System**: PMs can add/remove favorite providers for quick access

### P2 Features (Completed - Jan 17, 2026) ✅
1. **Quote Management UI**: 
   - PM can view pending quotes from providers in "Quotes" tab
   - "Approve & Schedule" and "Reject" buttons
   - Quote details: amount, duration, validity
   - Provider can submit quotes via Orders page
   
2. **Provider Quote Submission**:
   - Provider Orders page shows assigned orders
   - Quick quote input with amount field
   - "Send Quote" button
   - Status tracking (Pending → Quoted → Confirmed → In Progress → Done)
   
3. **Calendar Integration**:
   - Month and List view modes
   - Shows scheduled services with date/time
   - Click on date to see events
   - Automatic event creation when scheduling

4. **Service Scheduling**:
   - PM schedules service after approving quote
   - Date and time picker
   - Creates appointment record
   - Shows on PM Calendar

5. **PM Service Provider Browsing**:
   - New page at /property-manager/providers
   - Search and filter providers
   - Add/remove favorites
   - Send issues directly to providers

### P3 Features (Completed - Jan 11, 2026)
1. **Issue Classification**:
   - Small/Medium/Big categories
   - Visual badges on issues
   - One-click classification buttons
   - Issues grouped by size API

2. **Backend Refactoring**:
   - Created `/app/backend/models/schemas.py` with Pydantic models
   - Added new database columns: `issue_size`, `scheduled_date`, `scheduled_time`, `estimated_duration`
   - New API endpoints for classification, quotes, calendar

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **Authentication**: JWT
- **AI**: Google Gemini (via Emergent LLM Key)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Property Manager
- `POST /api/pm/generate-code` - Generate PM invite code
- `GET /api/pm/tenants` - Get PM's linked tenants
- `GET /api/pm/properties` - Get PM's properties
- `POST /api/pm/issues/{id}/send-to-provider` - Quick Send to provider
- `PUT /api/pm/issues/{id}/classify` - Classify issue size (P3)
- `GET /api/pm/issues/by-size` - Get issues grouped by size (P3)
- `GET /api/pm/quotes` - Get quotes to review (P2)
- `PUT /api/pm/orders/{id}/approve-quote` - Approve quote
- `PUT /api/pm/orders/{id}/reject-quote` - Reject quote
- `PUT /api/pm/orders/{id}/schedule` - Schedule service (P2)
- `GET /api/pm/calendar` - Get calendar events (P2)
- `GET /api/pm/favorites` - Get PM's favorite providers (NEW - Jan 16)
- `POST /api/pm/favorites` - Add provider to favorites (NEW - Jan 16)
- `DELETE /api/pm/favorites/{provider_id}` - Remove from favorites (NEW - Jan 16)

### Service Provider
- `GET /api/provider/orders` - Get assigned orders
- `POST /api/provider/orders/{id}/submit-quote` - Submit quote (P2)

### Tenant
- `POST /api/tenant/join-pm` - Join PM using code
- `POST /api/issues` - Report issue
- `GET /api/issues` - Get issues

### AI
- `POST /api/ai/summarize-issue` - AI chat for issue description

## New Components (P2/P3)

### Frontend
- `/app/frontend/src/components/PMCalendar.jsx` - Calendar with month/list views
- `/app/frontend/src/components/IssueSizeClassifier.jsx` - Issue size buttons
- `/app/frontend/src/components/ScheduleServiceModal.jsx` - Scheduling modal
- `/app/frontend/src/components/SubmitQuoteModal.jsx` - Provider quote submission
- `/app/frontend/src/pages/property-manager/PMServiceProviders.jsx` - PM provider browse page (NEW - Jan 16)

### Backend
- `/app/backend/models/schemas.py` - Pydantic models for all requests/responses

## Database Schema Updates (P2/P3)

### reported_issues table
- Added `issue_size` column (TEXT, default "medium")

### orders table
- Added `scheduled_date` column (TEXT)
- Added `scheduled_time` column (TEXT)
- Added `estimated_duration` column (TEXT)

### pm_favorite_providers table (NEW - Jan 16)
- `id` (TEXT PRIMARY KEY)
- `pm_id` (TEXT NOT NULL)
- `provider_id` (TEXT NOT NULL)
- `provider_name` (TEXT)
- `notes` (TEXT)
- `created_at` (TEXT)
- UNIQUE constraint on (pm_id, provider_id)

## Test Results (Jan 11, 2026)
- Backend P2/P3 tests: 18/19 passed (95% pass rate)
- Issue classification: ✅
- Quote submission: ✅
- Calendar: ✅
- Scheduling: ✅

## Test Results (Jan 17, 2026) - Iteration 4
- Backend tests: 22/22 passed (100% pass rate)
- Quote Management Workflow: ✅ All 13 tests passed
- Quote Rejection Flow: ✅ All 5 tests passed
- Authorization tests: ✅ All 4 tests passed
- Frontend UI: ✅ All components verified

### Complete Workflow Tested
1. Tenant creates issue → 2. PM sees issue → 3. PM sends to provider → 4. Provider sees order → 5. Provider submits quote → 6. PM reviews quote → 7. PM approves/rejects → 8. PM schedules service → 9. Calendar shows event

### Bugs Fixed (Jan 16, 2026)
1. **Tenant Issues Tab Blank** - Fixed API to check both 'homeowner' and 'tenant' user_types
2. **PM Code Disappearing** - PMCodeCard now syncs to localStorage
3. **Tenant Count Not Updating** - Added visibility change listener and callback to PMCodeCard

### Bugs Fixed (Jan 17, 2026)
1. **Session Loss on Tab Navigation** - Fixed `hasValidAuth is not defined` error in HomeownerDashboard
2. **Report Issues showing "Connect PM" warning** - Fixed ReportIssuesChat to check localStorage first
3. **Tenant/Homeowner confusion** - Improved flow for users who sign up without PM code then connect later
4. **Dummy providers showing in PM dashboard** - Added comprehensive test account filtering

### New Features (Jan 16, 2026)
1. **PM Favorites System** - PMs can add service providers to favorites
2. **PM Service Providers Page** - New page at `/property-manager/providers`

## Test Credentials
- PM: `e2e_pm_1768106090@test.com` / `test123`
- Tenant: `e2e_tenant_1768106091@test.com` / `test123`
- PM Code: `G1N3V6`

## Files Structure
```
/app
├── backend/
│   ├── server.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py        # NEW: Pydantic models
│   ├── doord.db
│   └── requirements.txt
├── frontend/src/
│   ├── components/
│   │   ├── PMCalendar.jsx           # NEW: P2
│   │   ├── IssueSizeClassifier.jsx  # NEW: P3
│   │   ├── ScheduleServiceModal.jsx # NEW: P2
│   │   ├── SubmitQuoteModal.jsx     # NEW: P2
│   │   ├── QuickSendToProvider.jsx
│   │   └── ...
│   ├── pages/
│   │   └── property-manager/
│   │       └── PropertyManagerOrders.jsx  # UPDATED: 5 tabs
│   └── services/
│       └── api.js                    # UPDATED: New API methods
└── test_reports/
    └── pytest/
        └── p2_p3_results.xml
```

## Future/Backlog Tasks

### P4 - UI/UX Updates (UPDATED)
- ~~Change "Homeowner" → "Tenant" throughout app~~ (User decided to keep both terms)
- Improve mobile responsiveness
- Add notifications for new quotes

### P4 - Template Response System
- Pre-built responses for common issues
- PM can quickly respond to tenants

### P4 - Quote Management UI (In Progress)
- Build frontend for PM to review/accept/reject quotes in "Quotes" tab
- Enhance Provider Orders page for quote submission

### P4 - Calendar Scheduling Flow (In Progress)
- Integrate ScheduleServiceModal with quote approval flow
- Connect to PMCalendar for event display

### P5 - Backend Refactoring (Further)
- Split server.py into proper routers
- Add unit tests for all endpoints
- API documentation with OpenAPI
