# Security Policy

We take security seriously and appreciate your effort to disclose vulnerabilities responsibly. This document outlines our security policy and guidelines for reporting security issues.

---

## Supported Versions

We ensure security updates and patches for the following versions of the project:

| Version | Supported          |
|---------|--------------------|
| 1.x     | ✅ Fully supported |

---

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please follow these steps:

1. **Email Us**  
   Send an email to `github-security@0xtejas.me` with the subject "Security Issue: [Project Name]". Include the following details:
   - Description of the vulnerability.
   - Steps to reproduce the issue (if applicable).
   - Any supporting evidence, such as code snippets, screenshots, or logs.

2. **Do Not Publicly Disclose**  
   Please avoid publicly discussing or disclosing the issue until we have had a chance to investigate and address it.

3. **Acknowledgment**  
   We will let you know your report within 72 hours and give you a timeline for the resolution.

---

## Dependencies and Known Risks

The project relies on several dependencies for both the backend and frontend. We recommend monitoring these for potential vulnerabilities:

### Backend
1. **Django**  
   - **Risk**: Ensure regular updates to mitigate vulnerabilities.  
   - **Monitor**: [Django Security Releases](https://www.djangoproject.com/weblog/).

2. **Django REST Framework**  
   - **Risk**: Potential exposure of sensitive data through APIs.  
   - **Monitor**: [DRF Security Announcements](https://www.django-rest-framework.org/community/release-notes/).

3. **django-cors-headers**  
   - **Risk**: Misconfiguration may allow unauthorized access.  
   - **Mitigation**: Restrict allowed origins to trusted domains.

4. **djangorestframework-simplejwt**  
   - **Risk**: Token mismanagement may lead to unauthorized access.  
   - **Mitigation**: Set short expiration times and use HTTPS for secure transmission.

5. **Poetry**  
   - **Risk**: Outdated dependencies can lead to vulnerabilities.  
   - **Mitigation**: Regularly run `poetry update`.

---

### Frontend
1. **Next.js**  
   - **Risk**: XSS and SSRF vulnerabilities.  
   - **Mitigation**: Validate all inputs and sanitize outputs.  
   - **Monitor**: [Next.js Security](https://nextjs.org/docs/security).

2. **React**  
   - **Risk**: Cross-Site Scripting (XSS).  
   - **Mitigation**: Use React's built-in XSS protection by avoiding `dangerouslySetInnerHTML`.

3. **Tailwind CSS**  
   - **Risk**: Misconfigured classes might expose sensitive content.  
   - **Mitigation**: Audit styles for accidental data exposure.

4. **@nextui-org/react**  
   - **Risk**: Library-specific vulnerabilities.  
   - **Mitigation**: Update regularly to the latest stable version.

5. **framer-motion**  
   - **Risk**: Limited security concerns, primarily animation errors.  
   - **Mitigation**: Test animations for performance and stability.

---

## Authentication Security

The project uses **JWT Authentication** with **Google OAuth**. Key considerations:
- **JWT Risks**:
  - Token theft can lead to unauthorized access.  
  - **Mitigation**: Use short-lived tokens and refresh tokens securely.
- **OAuth Risks**:
  - Misconfigured redirects may lead to phishing attacks.  
  - **Mitigation**: Validate redirect URIs and use HTTPS.

---

## Security Best Practices

We recommend the following practices for secure deployment:
1. Always use **HTTPS** to encrypt communications.
2. Regularly update dependencies by monitoring them for vulnerabilities.
3. Use environment variables for sensitive configuration values (e.g., secret keys).
4. Enable **CSRF protection** for API endpoints where appropriate.
5. Set up monitoring tools for security threats (e.g., Sentry, OWASP ZAP).

---

## Contact Us

For any security concerns or questions, please email us at `github-security@0xtejas.me`.

Thank you for helping us keep the project secure!
