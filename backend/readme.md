# API Documentation

## Authenticated Routes

### Google Login
- **URL**: `/api/auth/google/login/`
- **Method**: `GET`
- **Description**: Initiates Google OAuth login.
- **Authentication**: Not required

### Google Callback
- **URL**: `/api/auth/google/callback/`
- **Method**: `GET`
- **Description**: Handles Google OAuth callback.
- **Authentication**: Not required

### Logout
- **URL**: `/api/auth/logout/`
- **Method**: `POST`
- **Description**: Logs out the user.
- **Authentication**: Required

### Token Refresh
- **URL**: `/api/auth/token/refresh/`
- **Method**: `POST`
- **Description**: Refreshes the JWT token.
- **Authentication**: Not required

### Admin Redirect
- **URL**: `/api/auth/admin/redirect/`
- **Method**: `GET`
- **Description**: Redirects to the admin panel.
- **Authentication**: Required

### Admin Auto Login
- **URL**: `/api/auth/admin/auto-login/`
- **Method**: `POST`
- **Description**: Automatically logs in the admin.
- **Authentication**: Required

### Verify Token
- **URL**: `/api/auth/verify-token/`
- **Method**: `POST`
- **Description**: Verifies the JWT token.
- **Authentication**: Required

### Profile
- **URL**: `/api/auth/profile/`
- **Method**: `GET`
- **Description**: Retrieves the user's profile information.
- **Authentication**: Required
