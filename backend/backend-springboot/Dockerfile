# Multi-stage build for Spring Boot backend
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy gradle wrapper and configuration
COPY gradle ./gradle
COPY gradlew gradlew.bat ./
COPY build.gradle settings.gradle ./

# Copy source code
COPY src ./src

# Build the application (skip tests for faster build)
RUN chmod +x gradlew && ./gradlew build -x test --no-daemon

# Production stage
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/build/libs/backend-springboot-1.0.0.jar app.jar

# Set environment variables
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD java -cp app.jar org.springframework.boot.loader.JarLauncher \
  -Dspring.profiles.active=prod -Dspring.application.name=ecommerce-api \
  || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
CMD []
