# SecureCampus AI - Stage 1 Architecture Documentation

This document describes the clean architecture design, database relationships (ERD), authentication flows, and sequence diagrams for the Stage 1 Authentication Module of the SecureCampus AI Access System.

---

## 1. Clean Folder Architecture Diagram

The system employs a strict separation of concerns following clean MVC patterns on both the frontend and backend:

```
d:\Juniper\
├── backend/
│   ├── app/
│   │   ├── config/          # Configurations & environment variables loader
│   │   ├── models/          # SQLAlchemy database model entities
│   │   ├── schemas/         # Pydantic input/output schemas
│   │   ├── repositories/    # Database query abstraction layer
│   │   ├── services/        # Central domain business logic layer
│   │   ├── controllers/     # Route controller endpoints (mapped to routers)
│   │   ├── routes/          # FastAPI routers mounting paths
│   │   ├── middleware/      # CORS and session-check handlers
│   │   └── utils/           # Password hashing, JWT creation & OTP helpers
│   ├── tests/               # pytest test cases
│   ├── seed.py              # Superadmin & config database seed runner
│   ├── run.py               # server entry launcher (uvicorn)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static graphical resources
│   │   ├── components/      # Reusable styled UI elements (canvas, icons)
│   │   ├── constants/       # central options list (departments, roles)
│   │   ├── contexts/        # Auth and Theme provider states
│   │   ├── hooks/           # useSessionTimeout, useAuth hooks
│   │   ├── layouts/         # Navbar, Footer structures
│   │   ├── pages/           # Pages (Landing, Login, Register, Forgot, Reset)
│   │   ├── services/        # Axios API wrapper client
│   │   ├── styles/          # Tailwind custom index.css style definitions
│   │   ├── utils/           # Input validation expressions & formatting helpers
│   │   ├── App.jsx          # Route configurations
│   │   └── main.jsx         # client mount point
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── database/
│   ├── schema.sql           # MySQL database schema DDL queries
│   └── init_db.py           # Database setup script
```

---

## 2. Entity-Relationship (ER) Diagram

The database structure incorporates robust tables supporting dynamic settings, login audit logging, notifications, and strict Role-Based Access Control (RBAC):

```mermaid
erDiagram
    roles {
        int id PK
        varchar role_name UK
        text description
        timestamp created_at
    }
    
    permissions {
        int id PK
        varchar permission_name UK
        text description
        timestamp created_at
    }
    
    role_permissions {
        int role_id PK, FK
        int permission_id PK, FK
    }
    
    users {
        int id PK
        varchar fullname
        varchar email UK
        varchar phone
        varchar password_hash
        int role_id FK
        enum account_status
        varchar profile_image
        varchar college_id_upload
        datetime last_login
        datetime last_password_change
        boolean is_verified
        boolean is_first_login
        boolean account_locked
        int failed_login_attempts
        varchar department
        varchar roll_number
        varchar employee_id
        varchar parent_student_roll
        varchar relationship
        text purpose
        varchar duration
        timestamp created_at
        timestamp updated_at
    }
    
    user_sessions {
        varchar session_id PK
        int user_id FK
        datetime login_time
        datetime logout_time
        varchar device_name
        varchar browser
        varchar operating_system
        varchar ip_address
        varchar mac_address
        enum status
        int session_duration
    }
    
    password_reset {
        int id PK
        int user_id FK
        varchar otp_hash
        datetime expiry
        int otp_attempts
        boolean used
        timestamp created_at
    }
    
    activity_logs {
        int id PK
        int user_id FK
        varchar action
        text description
        varchar ip
        timestamp timestamp
    }
    
    notifications {
        int id PK
        varchar title
        text message
        varchar type
        int user_id FK
        boolean is_read
        timestamp created_at
    }
    
    system_settings {
        int id PK
        enum account_approval_mode
        varchar theme
        boolean maintenance_mode
        boolean allow_guest_registration
        boolean exam_mode
        int otp_expiry
        int session_timeout
    }

    roles ||--o{ users : "assigns"
    roles ||--|{ role_permissions : "links"
    permissions ||--|{ role_permissions : "links"
    users ||--o{ user_sessions : "starts"
    users ||--o{ password_reset : "requests"
    users ||--o{ activity_logs : "records"
    users ||--o{ notifications : "receives"
```

---

## 3. Authentication & Session Lifetime Sequence Diagram

This sequence traces the request loops from frontend components, through Axios API layers, to the backend service handlers, illustrating lockouts, token rotation, and auto-logout:

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Campus User
    participant App as React Frontend Client
    participant API as Axios Client (api.js)
    participant Srv as FastAPI AuthService
    participant DB as MySQL Database

    %% Registration
    Note over Operator, DB: Registration Flow
    Operator->>App: Submits Registration Form
    App->>API: POST /api/auth/register (payload)
    API->>Srv: Verify Email & Role Attributes
    Srv->>DB: Check email duplicate & Save User record
    DB-->>Srv: Success
    Srv-->>API: User details (Pending or Active)
    API-->>App: Display Success Toast
    App-->>Operator: Redirects to Sign In

    %% Login & Session Initialization
    Note over Operator, DB: Login & Lockout Protocol
    Operator->>App: Enters email and password
    App->>API: POST /api/auth/login
    API->>Srv: Validate credentials
    alt Password Invalid
        Srv->>DB: Increment failed_login_attempts
        alt Attempts >= 5
            Srv->>DB: Set account_status = 'Locked'
            Srv-->>API: 403 Account Locked Error
        else Attempts < 5
            Srv-->>API: 401 Unauthorized (attempts count)
        end
        API-->>App: Toast Error
        App-->>Operator: Display alert
    else Password Valid
        Srv->>DB: Clear failed_login_attempts & Create user_sessions
        Srv-->>API: Access Token + Refresh Token + Profile
        API->>App: Save tokens & Mount Auth State
        App->>App: Initialize 15-minute Inactivity Monitor
        App-->>Operator: Redirects to NOC Gate (Console)
    end

    %% Token Rotation (Token Lifetime Refresh)
    Note over Operator, DB: Refresh Token Rotation (RTR)
    App->>API: API Request (Access Token Expired)
    API->>API: Catch 401 Error
    API->>Srv: POST /api/auth/refresh (old Refresh Token)
    Srv->>DB: Validate Session in user_sessions
    alt Session Replay or Compromised Token
        Srv->>DB: Invalidate all active sessions for User
        Srv-->>API: 401 Re-auth Required
        API->>App: Reset tokens & state
        App-->>Operator: Force Logout & Show Warning
    else Valid Active Session
        Srv->>DB: Rotate Session ID, Save new pair
        Srv-->>API: New Access Token + New Refresh Token
        API->>API: Retry original request with new token
        API-->>App: Deliver request data
    end

    %% Inactivity Timeout (Auto Logout)
    Note over Operator, DB: Inactivity Monitor Timeout
    Operator->>App: Stops interaction (Inactivity > 15 mins)
    App->>API: POST /api/auth/logout
    API->>Srv: Terminate session
    Srv->>DB: Set session status = 'LoggedOut' & log_time
    Srv-->>API: Logged out
    API->>App: Clear client token contexts
    App-->>Operator: Reset UI to Login & Show Toast
```
