Core Authentication

User registration with secure password hashing (bcrypt)

User login with JWT access tokens

Refresh token generation & rotation

Logout with refresh token revocation

Session tracking via refresh tokens

Audit logging for all auth events

Security Best Practices

Passwords stored as bcrypt hashes

Refresh tokens stored hashed (never raw)

Short-lived access tokens + long-lived refresh tokens

Token revocation & expiration handling

Consistent error responses (no auth leakage)

Infrastructure

Dockerized API, PostgreSQL, and Redis

Prisma ORM with migrations

Health, liveness, and readiness endpoints

Automatic DB migration on container startup

Redis-backed dependency health checks