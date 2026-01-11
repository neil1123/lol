# Doord - Property Management Application

## Original Problem Statement
Build a full-stack application for Property Managers and Tenants. The core workflow involves:
1. Tenant reporting an issue
2. Property manager reviews and forwards to a service provider
3. Service provider provides quote and completes work

## Key Features
1. **User Roles & Linking**: Separate dashboards for Tenants, Property Managers, and Service Providers
2. **PM Code System**: Tenants can link to a Property Manager using a unique 6-character code
3. **AI-Powered Issue Reporting**: Tenants report issues via simple prompt that transitions to structured form
4. **End-to-End Issue Resolution Flow**: Tenant → PM → Service Provider workflow
5. **Property Tracking**: Capture and display tenant property addresses
6. **Quick Send to Provider**: One-click sending of issues to service providers (NEW)

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **Authentication**: JWT
- **AI**: Google Gemini (via Emergent LLM Key)

## What's Been Implemented (as of Jan 11, 2026)

### Completed - Tested & Verified ✅
- [x] User authentication (registration/login) for all roles
- [x] Property Manager dashboard with code generation
- [x] Tenant linking via PM code (both during registration and after)
- [x] Property information capture during tenant linking
- [x] PM Dashboard showing linked tenants and properties
- [x] Tenant dashboard with "My Issues" tab
- [x] Service Provider dashboard for orders/quotes
- [x] Report Issues flow with AI-powered summary (simple prompt → form → summary)
- [x] **Quick Send to Provider** - One-click provider assignment from PM Orders page

### Quick Send to Provider Feature (NEW - Jan 11, 2026)
- **Component**: `/app/frontend/src/components/QuickSendToProvider.jsx`
- **Flow**:
  1. PM views pending issues in Orders page
  2. Dropdown shows available providers (auto-sorted by relevance)
  3. "Match" badge shows for providers whose services match issue category
  4. One-click "Send Now" button sends issue to provider
  5. Issue status updates to "sent_to_provider"
  6. Order created with "pending_quotation" status
- **Backend**: `POST /api/pm/issues/{issue_id}/send-to-provider`

### Test Results (Jan 11, 2026)
- Backend: 100% pass rate (8/8 tests passed)
- Frontend: 100% all Quick Send UI flows working
- Test file: `/app/tests/test_quick_send_provider.py`

### Test Credentials
- PM: e2e_pm_1768106090@test.com / test123
- Tenant: e2e_tenant_1768106091@test.com / test123
- PM Code: G1N3V6
- Service Providers: Bob's Home Services, Test Home Services

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Property Manager
- `POST /api/pm/generate-code` - Generate PM invite code
- `GET /api/pm/tenants` - Get PM's linked tenants
- `GET /api/pm/properties` - Get PM's properties with tenant info
- `POST /api/pm/issues/{issue_id}/send-to-provider` - **NEW** Quick Send to provider

### Tenant
- `POST /api/tenant/join-pm` - Tenant joins PM using code
- `POST /api/issues` - Create issue report
- `GET /api/issues` - Get issues for user

### AI
- `POST /api/ai/summarize-issue` - AI chat for issue description
- `POST /api/ai/generate-summary` - Generate final AI summary

### Orders & Quotes
- `GET /api/orders` - Get orders
- `PUT /api/pm/orders/{order_id}/approve-quote` - PM approves quote
- `PUT /api/pm/orders/{order_id}/reject-quote` - PM rejects quote

## Database Schema (SQLite)
- **users**: id, email, password_hash, user_type, name, phone, address, business_name, pm_code, property_manager_id, property_address, unit_number
- **reported_issues**: id, tenant_id, property_manager_id, description, ai_summary, status, issue_category, urgency_level, assigned_provider_id, assigned_provider_name, linked_order_id
- **orders**: id, homeowner_id, provider_id, service_type, status, source_issue_id, property_manager_id, pm_approved

## Upcoming Tasks (P2)

### Quote Management UI
- Build out the "Quotes" tab on PM Orders page
- Allow PM to review, accept, or reject quotes from providers
- Service Provider submits quotes via their dashboard

### Calendar Integration
- Add calendar view for scheduling services
- Based on approved quotes

## Future/Backlog Tasks

### Issue Classification (P3)
- Categorize issues as "Small" vs "Big"
- Different workflows for each type

### Template Response System (P3)
- Pre-built responses for common issues
- PM can quickly respond to tenants

### UI Updates (P3)
- Change "Homeowner" → "Tenant" throughout app
- Consistent terminology

### Backend Refactoring (P3)
- Split server.py into routers/models/services
- Better code organization for maintainability

## Files Structure
```
/app
├── backend/
│   ├── server.py           <- Monolithic backend (needs refactoring)
│   ├── doord.db            <- SQLite database
│   └── requirements.txt
├── frontend/src/
│   ├── components/
│   │   ├── QuickSendToProvider.jsx  <- NEW: One-click send component
│   │   ├── SendToProviderModal.jsx  <- Advanced send options
│   │   ├── ReportIssuesChat.jsx     <- Tenant issue reporting
│   │   └── PMCodeCard.jsx
│   ├── pages/
│   │   ├── property-manager/
│   │   │   ├── PropertyManagerOrders.jsx  <- UPDATED: With Quick Send
│   │   │   ├── PropertyManagerDashboard.jsx
│   │   │   └── PropertyManagerAuth.jsx
│   │   └── homeowner/
│   └── services/
│       └── api.js
├── tests/
│   └── test_quick_send_provider.py  <- NEW: Quick Send tests
└── test_reports/
    ├── iteration_1.json
    └── iteration_2.json
```
