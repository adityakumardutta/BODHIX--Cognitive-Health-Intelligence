# ============================================================================
# Multi-stage Dockerfile for DementiaScreen Spring Boot backend
# ============================================================================
# Build stage: compiles the application using Maven + JDK 17
# Run stage: ships only the JRE + built jar for a lean production image
# ============================================================================

# ---- Stage 1: Build ----
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy pom.xml first so Docker can cache the dependency layer
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Copy source and build the Spring Boot fat jar
COPY src ./src
RUN mvn -B -q -DskipTests package \
 && mv target/dementia-screen-backend-*.jar app.jar

# ---- Stage 2: Run ----
FROM eclipse-temurin:17-jre-alpine AS run
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Only the built jar is copied from the build stage
COPY --from=build /workspace/app.jar app.jar

# Spring Boot / Render
# The app binds to 0.0.0.0 and reads the port from the PORT environment variable
# (falling back to 8081 for local runs) via application.properties. Render injects
# its own PORT at runtime, which overrides any default here.
# EXPOSE is documentation only and does NOT affect Render's dynamic PORT binding.
EXPOSE 8081

# Drop to non-root user
USER appuser

# Run the Spring Boot jar. The server port is resolved from the PORT environment
# variable by application.properties (server.port=${PORT:8081}), so no fixed port
# is hardcoded here and Render's dynamic PORT reaches Spring Boot automatically.
# NOTE: exec-form ENTRYPOINT does not expand "$PORT", so we rely on Spring Boot's
# own environment-variable resolution instead of passing --server.port.
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
