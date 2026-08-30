# syntax=docker/dockerfile:1

FROM node:20.14.0-alpine3.20 AS frontend-build
WORKDIR /workspace/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
ARG VITE_API_URL=http://localhost:8090
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM maven:3.9.9-eclipse-temurin-17-alpine AS backend-build
WORKDIR /workspace

COPY backend/pom.xml ./backend/pom.xml
COPY backend/src ./backend/src
COPY --from=frontend-build /workspace/frontend/dist ./backend/src/main/resources/static

RUN mvn -f /workspace/backend/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=backend-build /workspace/backend/target/*.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
