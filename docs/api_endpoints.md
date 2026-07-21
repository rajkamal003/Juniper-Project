# SecureCampus AI - Stage 1 API Specifications

This document describes the REST API endpoints provided by the Authentication Module. All request payloads and response bodies use JSON format.

---

## 1. User Registration

Enrolls a new campus security operator or guest. Assigns the user status dynamically based on the global approval configuration (`AUTO` or `ADMIN`).

* **Endpoint**: `POST /api/auth/register`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "fullname": "John Doe",
    "email": "johndoe@securecampus.com",
    "phone": "+919876543210",
    "role_id": 3,
    "password": "Password123!",
    "confirm_password": "Password123!",
    
    "department": "CSE",
    "roll_number": "22CSE1042",
    "duration": "2",
    
    "profile_image": "https://example.com/avatar.jpg",
    "college_id_upload": "https://example.com/id.pdf"
  }
  ```
* **Validation Rules**:
  * **fullname**: 3 to 100 characters.
  * **email**: Must be a unique, syntactically valid email format.
  * **phone**: Valid phone format (allowed: `+`, numbers, spaces, hyphens).
  * **password**: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special symbol (`@$!%*?&#`).
  * **role_id**: Integer representing roles: `2: Faculty`, `3: Student`, `4: Parent Visitor`, `5: Guest`.
  * **Conditional Fields**:
    * If **Faculty (2)**: `employee_id` and `department` are required.
    * If **Student (3)**: `roll_number`, `department`, and `duration` (Year: `1, 2, 3, 4`) are required.
    * If **Parent Visitor (4)**: `parent_student_roll` and `relationship` are required.
    * If **Guest (5)**: `purpose` and `duration` (`2 Hours, 4 Hours, 8 Hours, 1 Day`) are required.
* **Success Response (201 Created)**:
  ```json
  {
    "id": 2,
    "fullname": "John Doe",
    "email": "johndoe@securecampus.com",
    "phone": "+919876543210",
    "role_id": 3,
    "role": {
      "id": 3,
      "role_name": "Student",
      "description": "..."
    },
    "account_status": "Active",
    "profile_image": "https://example.com/avatar.jpg",
    "college_id_upload": "https://example.com/id.pdf",
    "is_verified": false,
    "is_first_login": true,
    "department": "CSE",
    "roll_number": "22CSE1042",
    "duration": "2",
    "employee_id": null,
    "parent_student_roll": null,
    "relationship": null,
    "purpose": null
  }
  ```
* **Errors**:
  * `400 Bad Request`: Email already registered.
  * `422 Unprocessable Entity`: Missing or invalid fields.

---

## 2. Authenticate User (Login)

Validates user credentials, increments failed counters on mismatch, triggers account lockouts after 5 consecutive failures, and logs audit sessions.

* **Endpoint**: `POST /api/auth/login`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "email": "johndoe@securecampus.com",
    "password": "Password123!",
    "remember_me": false,
    
    "device_name": "Desktop Web client",
    "browser": "Chrome",
    "operating_system": "Windows",
    "ip_address": "127.0.0.1",
    "mac_address": "00:00:00:00:00:00"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 2,
      "fullname": "John Doe",
      "email": "johndoe@securecampus.com",
      "role_id": 3,
      "account_status": "Active",
      "is_verified": false,
      "is_first_login": false,
      ...
    }
  }
  ```
* **Errors**:
  * `401 Unauthorized`: Invalid credentials.
  * `403 Forbidden`: Account is `Locked`, `Pending`, `Suspended`, or `Rejected`.

---

## 3. Request Password Reset OTP

Generates a cryptographically secure 6-digit numeric OTP, hashes the code before DB insertion, logs the request, and enforces a 60-second cooldown rate limit.

* **Endpoint**: `POST /api/auth/forgot-password`
* **Request Body**:
  ```json
  {
    "email": "johndoe@securecampus.com"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "If the email matches an active account, a 6-digit OTP code has been generated.",
    "debug_otp": "782390" // Only returned in debug/development mode
  }
  ```
* **Errors**:
  * `429 Too Many Requests`: Triggered if OTP is requested within 60 seconds of the previous generation.

---

## 4. Verify OTP Code

Checks user OTP code submissions, increments failed verification counters, and locks the OTP entry after 3 consecutive failures. Returns a short-lived recovery token on success.

* **Endpoint**: `POST /api/auth/verify-otp`
* **Request Body**:
  ```json
  {
    "email": "johndoe@securecampus.com",
    "otp": "782390"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "OTP verified successfully.",
    "reset_token": "eyJhbGciOi..." // Short-lived (10 mins) signed JWT recovery token
  }
  ```
* **Errors**:
  * `400 Bad Request`: Invalid OTP code, or OTP expired, or maximum attempts (3) exceeded.
  * `404 Not Found`: Account missing.

---

## 5. Complete Password Reset

Uses the signed recovery token to reset the password, sets failed login counters to 0, unlocks status gates, and invalidates all active user sessions for safety compliance.

* **Endpoint**: `POST /api/auth/reset-password`
* **Request Body**:
  ```json
  {
    "email": "johndoe@securecampus.com",
    "reset_token": "eyJhbGciOi...",
    "new_password": "NewPassword123!",
    "confirm_password": "NewPassword123!"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Password reset completed successfully. You can now login with your new credentials."
  }
  ```
* **Errors**:
  * `400 Bad Request`: Token expired/invalid, token already used, or passwords mismatch.

---

## 6. Retrieve User Profile

Exposes profile parameters of the authenticated user.

* **Endpoint**: `GET /api/auth/profile`
* **Headers**: `Authorization: Bearer <access_token>`
* **Success Response (200 OK)**:
  ```json
  {
    "id": 2,
    "fullname": "John Doe",
    "email": "johndoe@securecampus.com",
    "phone": "+919876543210",
    "role_id": 3,
    "role": {
      "id": 3,
      "role_name": "Student",
      "description": "..."
    },
    "account_status": "Active",
    "is_verified": false,
    "is_first_login": false,
    ...
  }
  ```
* **Errors**:
  * `401 Unauthorized`: Missing, invalid, or expired access token.

---

## 7. Terminate Session (Logout)

Ends the authenticated session, computes the connection duration in seconds, and updates session logs.

* **Endpoint**: `POST /api/auth/logout`
* **Headers**: `Authorization: Bearer <access_token>`
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
* **Errors**:
  * `401 Unauthorized`: Missing or invalid token.

---

## 8. Refresh Token Rotation (RTR)

Exchanges a valid refresh token for a newly rotated access and refresh token pair. If a revoked refresh token is re-submitted, the rotation engine triggers the revocation protocol, terminating all user sessions.

* **Endpoint**: `POST /api/auth/refresh`
* **Request Body**:
  ```json
  {
    "refresh_token": "eyJhbGciOi..."
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": { ... }
  }
  ```
* **Errors**:
  * `401 Unauthorized`: Invalid/expired refresh token, or token compromised (replay attack).

---

## 9. Retrieve System Configuration

Allows the client to fetch dynamic configurations like dynamic session timeout values.

* **Endpoint**: `GET /api/auth/settings`
* **Success Response (200 OK)**:
  ```json
  {
    "account_approval_mode": "AUTO",
    "theme": "dark",
    "maintenance_mode": false,
    "allow_guest_registration": true,
    "exam_mode": false,
    "otp_expiry": 300,
    "session_timeout": 900
  }
  ```
