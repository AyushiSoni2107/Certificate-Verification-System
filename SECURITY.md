# Security Policy

## Protect Secrets

- Do not commit `MONGODB_URI`, `JWT_SECRET`, or API URLs to GitHub
- Keep all production secrets only in Vercel environment variables
- Never use `localhost` values in deployed production settings

## Protect Access

- Verify user roles on the backend for protected routes
- Keep admin actions restricted to authenticated admin users only
- Clear tokens on logout and do not share account credentials

## Protect Certificates

- Generate certificates only from the live deployed backend
- Use the live frontend URL for QR code verification links
- Regenerate certificates after changing deployment URLs

## Report Issues

If you find a security issue, report it privately to the maintainer with:

- A short description of the problem
- The affected page or API route
- Steps to reproduce it

