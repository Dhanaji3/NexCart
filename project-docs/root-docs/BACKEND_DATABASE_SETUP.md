# Backend + Database Setup (Windows, Step-by-Step)

This guide covers **everything from installation to configuration** for the Spring Boot backend + PostgreSQL database.

## Current backend behavior notes

- Cart update requests are accepted through the current cart endpoint contract used by the frontend.
- Product stock values persist correctly from admin create/update payloads.
- Admin order status updates use the dedicated admin endpoint.

Project paths used in this guide:

- Backend: `backend/backend-springboot`
- Backend config: `backend/backend-springboot/src/main/resources/application.yml`

---

## 1) Install required software

### 1.1 Install Java 17

1. Install JDK 17 (Temurin/Oracle/OpenJDK).
2. Verify:
   - `java -version`
3. Expected major version: `17`.

### 1.2 Install Gradle (recommended)

> Your project has `build.gradle` and should run with Gradle.

1. Install Gradle 8+.
2. Add Gradle `bin` to PATH.
3. Verify:
   - `gradle -v`

> Note: `backend/backend-springboot/gradlew.bat` exists, but if `gradle/wrapper/gradle-wrapper.jar` is missing, wrapper commands fail. In that case, use system Gradle (`gradle ...`) until wrapper is fixed.

### 1.3 Install PostgreSQL 15+

1. Install PostgreSQL (include pgAdmin + command line tools).
2. During install, set superuser password (example used by project: `postgres`).
3. Verify PostgreSQL service is running.
4. Verify CLI:
   - `psql --version`

---

## 2) Create and configure database

The backend currently expects:

- DB name: `ecommerce_db`
- Username: `postgres`
- Password: `postgres`
- Port: `5432`

These values are defined in `application.yml`.

### 2.1 Create DB

Open terminal and run:

1. `psql -U postgres -h localhost -p 5432`
2. Inside psql:
   - `CREATE DATABASE ecommerce_db;`
   - `\l` (confirm DB exists)
   - `\q`

### 2.2 (Optional) Create dedicated app user

If you want a separate DB user instead of `postgres`:

1. `psql -U postgres -h localhost -p 5432`
2. Run:
   - `CREATE USER ecommerce_user WITH PASSWORD 'StrongPassword123!';`
   - `GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;`
3. Then update `application.yml` datasource username/password accordingly.

---

## 3) Configure backend application

File: `backend/backend-springboot/src/main/resources/application.yml`

Current important values:

- `server.port: 8080`
- `spring.datasource.url: jdbc:postgresql://localhost:5432/ecommerce_db`
- `spring.datasource.username: postgres`
- `spring.datasource.password: postgres`
- `spring.jpa.hibernate.ddl-auto: update`

### 3.1 JWT secret (recommended)

The app reads:

- `jwt.secret: ${JWT_SECRET:your-secret-key-change-this-in-production-at-least-32-characters-long}`

Set a strong secret in terminal before run (current session):

- PowerShell: `$env:JWT_SECRET="replace-with-at-least-32-characters-secret"`

Persist for future sessions (Windows):

- `setx JWT_SECRET "replace-with-at-least-32-characters-secret"`
- Open a new terminal after `setx`.

---

## 4) Run backend

From project root:

1. `cd backend/backend-springboot`
2. `gradle clean build`
3. `gradle bootRun`

If Gradle wrapper is fixed later, you can use:

- `.\gradlew.bat clean build`
- `.\gradlew.bat bootRun`

Backend should start on:

- `http://localhost:8080`

Swagger UI:

- `http://localhost:8080/swagger-ui.html`

---

## 5) Verify backend + database

### 5.1 Check API docs endpoint

- Open: `http://localhost:8080/v3/api-docs`

### 5.2 Check Swagger

- Open: `http://localhost:8080/swagger-ui.html`

### 5.3 Check DB tables created by JPA

1. `psql -U postgres -h localhost -p 5432 -d ecommerce_db`
2. `\dt`

If tables appear, backend↔database connection is working.

---

## 6) Connect frontend to Spring backend (when needed)

If you want frontend to use Spring Boot APIs instead of mock API:

1. Set frontend API URL to `http://localhost:8080/api`
2. Rebuild/restart frontend

(Your current frontend setup can also run against mock API at port 3001.)

---

## 7) Troubleshooting

### Problem: `gradle` not recognized

- Gradle is not installed or PATH not set.
- Fix PATH and reopen terminal.

### Problem: `gradlew.bat` fails

- Check if `backend/backend-springboot/gradle/wrapper/gradle-wrapper.jar` exists.
- If missing, use installed Gradle commands (`gradle clean build`, `gradle bootRun`).

### Problem: DB authentication failed

- Verify username/password in PostgreSQL and `application.yml` match.

### Problem: Port 5432 already in use

- Another PostgreSQL instance may already be running with different credentials.
- Either reuse that instance and align credentials, or change datasource port.

### Problem: Port 8080 already in use

- Stop existing process on 8080 or change `server.port` in `application.yml`.

### Problem: JWT key size / auth issues

- Ensure `JWT_SECRET` is set and at least 32 characters.

---

## 8) Quick run checklist

- [ ] Java 17 installed (`java -version`)
- [ ] Gradle installed (`gradle -v`)
- [ ] PostgreSQL running (`psql --version` + service running)
- [ ] DB created (`ecommerce_db`)
- [ ] Credentials in `application.yml` match DB
- [ ] `JWT_SECRET` set
- [ ] Backend runs on `http://localhost:8080`
- [ ] Swagger works on `http://localhost:8080/swagger-ui.html`
