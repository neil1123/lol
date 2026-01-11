# Doord - Property Management Application

## Original Problem Statement
Build a full-stack application for Property Managers and Tenants. The core workflow involves:
1. Tenant reporting an issue
2. Property manager reviews and forwards to a service provider
3. Service provider provides quote and completes work

## Key Features
1. **User Roles & Linking**: Separate dashboards for Tenants, Property Managers, and Service Providers
2. **PM Code System**: Tenants can link to a Property Manager using a unique code
3. **AI-Powered Issue Reporting**: Tenants report issues via AI-assisted interface (Gemini)
4. **End-to-End Issue Resolution Flow**: Tenant → PM → Service Provider workflow
5. **Property Tracking**: Capture and display tenant property addresses

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **Authentication**: JWT
- **AI**: Google Gemini (via Emergent LLM Key)

## What's Been Implemented (as of Jan 11, 2026)

### Completed
- [x] User authentication (registration/login) for all roles
- [x] Property Manager dashboard with code generation
- [x] Tenant linking via PM code (both during registration and after)
- [x] Property information capture during tenant linking
- [x] PM Dashboard showing linked tenants and properties
- [x] Tenant dashboard with issue reporting form
- [x] Service Provider dashboard for orders/quotes
- [x] Backend endpoints for all CRUD operations
- [x] **Bug Fix**: Missing `/api/pm/tenants` route decorator
- [x] **Bug Fix**: PM Dashboard not updating with new tenants/properties
- [x] **Bug Fix**: PM Login failing (incorrect function call signature)
- [x] **Bug Fix**: Properties API returning hardcoded empty object

### P0 Issues - Resolved
1. ✅ PM Registration failing - Fixed login function signature
2. ✅ PM Dashboard doesn't update with new tenants/properties - Fixed route decorator and API service

### P1 Issues - Pending
1. "Report Issues" feature UI needs redesign (simple prompt bar instead of chat)
2. AI summarization flow needs completion

### P2 - Upcoming Tasks
- Complete PM-to-Provider workflow
- Build Quote Management UI
- Calendar integration for scheduling

### Future/Backlog
- Issue classification system (Small vs Big issues)
- Template response system for PMs
- UI text update: "Homeowner" → "Tenant"
- Backend refactoring (split server.py into routers/models/services)

## Key API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/pm/generate-code` - Generate PM invite code
- `GET /api/pm/tenants` - Get PM's linked tenants
- `GET /api/pm/properties` - Get PM's properties with tenant info
- `POST /api/tenant/join-pm` - Tenant joins PM using code
- `POST /api/issues` - Create issue report
- `GET /api/issues` - Get issues for user

## Database Schema (SQLite)
- **users**: id, email, password_hash, user_type, name, phone, address, business_name, pm_code, property_manager_id, property_address, unit_number
- **reported_issues**: id, tenant_id, property_manager_id, description, ai_summary, status, etc.
- **orders**: id, homeowner_id, provider_id, service_type, status, etc.
- **properties**: Tracked via users table (property_address, unit_number fields)

## Test Credentials
- PM: e2e_pm_1768106090@test.com / test123
- Tenant: e2e_tenant_1768106091@test.com / test123
