# Laboratory Management System - Setup Guide

This is a comprehensive laboratory project management system with multi-role approval workflows and client management capabilities.

## User Roles

The system supports 8 different user roles:

1. **Lab Director** - Full system access, user management, oversight of all operations
2. **Engineer** - Creates and manages projects, uploads results
3. **Supervisor** - Reviews and approves engineer projects
4. **HSM (Health & Safety Manager)** - Reviews projects for safety compliance
5. **Lab Technician** - Verifies engineer training and equipment certification
6. **Quality Manager** - Monitors project quality, can flag issues
7. **External Client** - Submits project requests and proposals
8. **Account Manager** - Manages client requests, creates quotations

## Initial Setup

### Admin Account Credentials

Your initial Lab Director account has been created with the following credentials:

**Email:** shashank@rgu.com
**Password:** 12345

**Important:** Please change this password after your first login by navigating to your user menu and selecting "Change Password".

### Getting Started

1. **Login** - Use the credentials above to login at `/login`
2. **Change Password** - Update your password for security
3. **Create Users** - Navigate to User Management to create accounts for:
   - Engineers
   - Supervisors
   - HSM (Health & Safety Manager)
   - Lab Technicians
   - Quality Managers
   - External Clients
   - Account Managers

### Creating Additional Users

As Lab Director, you can create users through the User Management interface:

1. Navigate to User Management from your dashboard
2. Click "Create New User"
3. Enter user details (email, full name, role)
4. A temporary password will be generated
5. Provide the credentials to the new user
6. They should change their password on first login

## Workflow Overview

### Internal Project Workflow

1. **Engineer** creates a project proposal with all required details
2. **Supervisor** reviews and approves/requests changes
3. **HSM** reviews for safety compliance
4. **Lab Technician** verifies engineer training on equipment
5. Project becomes **Approved** and engineer can begin work
6. Engineer uploads results when completed
7. **Quality Manager** monitors throughout for quality standards

### Client Request Workflow

1. **External Client** submits a problem or proposal
2. **Account Manager** reviews and drafts response with quotation
3. Client reviews quotation and accepts/rejects
4. If accepted, Account Manager converts to internal project
5. Project follows normal internal workflow
6. Client can view project progress and results

## Key Features

- **Role-based dashboards** tailored to each user type
- **Sequential approval workflow** with comment capability
- **Real-time notifications** for all user actions
- **Client portal** for external stakeholders
- **Results visualization** with CSV/Excel upload support
- **Quality flagging system** for standards monitoring
- **Complete audit trail** with timestamps and comments

## Technical Details

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Security**: Row Level Security (RLS) policies for all data access
- **Real-time**: Automatic updates via Supabase subscriptions

## Database Schema

The system includes these main tables:

- `user_profiles` - User information and roles
- `projects` - Internal project details and status
- `client_requests` - Client submissions
- `client_responses` - Account manager quotations
- `client_request_messages` - Client-manager communication
- `comments` - Project feedback and discussions
- `approvals` - Approval workflow tracking
- `project_results` - Uploaded experiment data
- `notifications` - User notification system

All tables have Row Level Security enabled to ensure data access is properly restricted based on user roles.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck
```

## Support

For any issues or questions, contact your system administrator.
