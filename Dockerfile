# syntax=docker/dockerfile:1

# Stage 1: Build Frontend React SPA
FROM node:20.14.0-alpine3.20 AS frontend-build
WORKDIR /workspace/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Stage 2: Build Backend Spring Boot with Java 21 and embedded Frontend Assets
FROM maven:3.9.9-eclipse-temurin-21-alpine AS backend-build
WORKDIR /workspace

COPY backend/pom.xml ./backend/pom.xml
COPY backend/src ./backend/src
COPY --from=frontend-build /workspace/frontend/dist ./backend/src/main/resources/static

RUN mvn -f /workspace/backend/pom.xml clean package -DskipTests

# Stage 3: Production Runtime Container with Java 21 JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Ensure storage directory for persistent H2 database
RUN mkdir -p /app/data

COPY --from=backend-build /workspace/backend/target/*.jar /app/app.jar

ENV PORT=8090
EXPOSE 8090

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
