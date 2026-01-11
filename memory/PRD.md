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
- [x] PM Dashboard showing linked tenants and properties (FIXED)
- [x] Tenant dashboard with "My Issues" tab
- [x] Service Provider dashboard for orders/quotes
- [x] Backend endpoints for all CRUD operations

### Bug Fixes Applied (Jan 11, 2026)
1. ✅ **Missing route decorator** - `/api/pm/tenants` endpoint now has `@api_router.get` decorator
2. ✅ **Hardcoded empty response** - `getPropertyManagerProperties()` now calls API correctly
3. ✅ **PM Login function signature** - Fixed to pass credentials as object
4. ✅ **Report Issues UI Redesign** - Changed from chat to simple prompt bar with 4-step flow

### Report Issues Flow (New Design)
- **Step 1**: Simple prompt bar - "What's the problem?"
- **Step 2**: Details form - Unit number, category, urgency, best time, permission to enter
- **Step 3**: Summary review - AI-generated summary with edit option
- **Step 4**: Success confirmation

### Test Results (Jan 11, 2026)
- Backend: 94% pass rate (15/16 tests)
- Frontend: 100% all flows verified

### Test Credentials
- PM: e2e_pm_1768106090@test.com / test123
- Tenant: e2e_tenant_1768106091@test.com / test123
- PM Code: G1N3V6

### P2 - Upcoming Tasks
- Complete PM-to-Provider workflow (Send issue to service provider)
- Build Quote Management UI (Provider submits quote, PM approves)
- Calendar integration for scheduling services

### Future/Backlog
- Issue classification system (Small vs Big issues)
- Template response system for PMs
- UI text update: "Homeowner" → "Tenant" throughout
- Backend refactoring (split server.py into routers/models/services)

## Key API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/pm/generate-code` - Generate PM invite code
- `GET /api/pm/tenants` - Get PM's linked tenants ✅ FIXED
- `GET /api/pm/properties` - Get PM's properties with tenant info ✅ FIXED
- `POST /api/tenant/join-pm` - Tenant joins PM using code
- `POST /api/issues` - Create issue report
- `GET /api/issues` - Get issues for user
- `POST /api/ai/summarize-issue` - AI chat for issue description
- `POST /api/ai/generate-summary` - Generate final AI summary

## Database Schema (SQLite)
- **users**: id, email, password_hash, user_type, name, phone, address, business_name, pm_code, property_manager_id, property_address, unit_number
- **reported_issues**: id, tenant_id, property_manager_id, description, ai_summary, status, issue_category, urgency_level, etc.
- **orders**: id, homeowner_id, provider_id, service_type, status, source_issue_id, etc.
