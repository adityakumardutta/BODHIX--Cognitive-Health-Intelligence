# ============================================================================
# BODHIX — Single-container deployment (React SPA + Spring Boot API)
# ============================================================================
# Build context: repository ROOT (docker build -f Dockerfile .)
#
# Stage 1 builds the React/Vite frontend (frontend/dist).
# Stage 2 builds the Spring Boot fat jar and copies frontend/dist into
#          classpath:/static so ONE Spring Boot process serves BOTH the
#          React UI (SPA fallback via SpaWebConfig) and the /api/** REST API.
# Stage 3 runs the jar on the JRE-only image (identical runtime to the
#          original backend/Dockerfile; binds 0.0.0.0:$PORT for Render).
#
# The existing backend/Dockerfile is left untouched so the current
# Render backend service is unaffected during migration.
# ============================================================================

# ---- Stage 1: Frontend build (React + Vite) ----
FROM node:20-alpine AS frontend-build
WORKDIR /app

# Lockfile-first for npm cache efficiency
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend ./
RUN npm run build

# ---- Stage 2: Backend build (Maven + JDK 17) ----
FROM maven:3.9.9-eclipse-temurin-17 AS backend-build
WORKDIR /workspace

# Copy pom.xml first so Docker can cache the dependency layer
COPY backend/pom.xml .
RUN mvn -B -q dependency:go-offline

# Copy backend source
COPY backend/src ./src

# Embed the built React app into Spring Boot's static resources.
# Spring Boot serves classpath:/static automatically; SPA deep-link
# fallback is handled by SpaWebConfig (config/SpaWebConfig.java).
COPY --from=frontend-build /app/dist ./src/main/resources/static

# Build the Spring Boot fat jar
RUN mvn -B -q -DskipTests package \
 && mv target/dementia-screen-backend-*.jar app.jar

# ---- Stage 3: Run ----
FROM eclipse-temurin:17-jre-alpine AS run
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Only the built jar is copied from the build stage
COPY --from=backend-build /workspace/app.jar app.jar

# Spring Boot / Render
# The app binds to 0.0.0.0 and reads the port from the PORT environment
# variable (falling back to 8081 for local runs) via application.properties
# (server.port=${PORT:8081}, server.address=0.0.0.0). Render injects its own
# PORT at runtime, which overrides any default here. EXPOSE is documentation
# only and does NOT affect Render's dynamic PORT binding.
EXPOSE 8081

# Drop to non-root user
USER appuser

# Run the Spring Boot jar. The server port is resolved from the PORT
# environment variable by application.properties, so no fixed port is
# hardcoded here and Render's dynamic PORT reaches Spring Boot automatically.
# NOTE: exec-form ENTRYPOINT does not expand "$PORT", so we rely on Spring
# Boot's own environment-variable resolution instead of passing --server.port.
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]