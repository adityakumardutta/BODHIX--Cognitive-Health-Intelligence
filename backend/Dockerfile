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
# Render (and most cloud platforms) inject PORT; default to 8080 for local runs.
ENV PORT=8080
EXPOSE ${PORT}

# Drop to non-root user
USER appuser

# Run the Spring Boot jar. --server.port picks up $PORT at runtime.
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar", \
  "--server.port=${PORT}"]
