# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Update all packages to latest versions with security patches
RUN apk upgrade --no-cache --available && rm -rf /var/cache/apk/*

# Copy JAR and set up non-root user
COPY --from=build /app/target/*.jar app.jar
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser && \
    chown appuser:appgroup /app/app.jar

USER appuser
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]

