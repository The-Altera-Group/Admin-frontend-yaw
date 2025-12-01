FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the multi-module parent POM and the student-service module into the build context
# We expect the build context to be the repository root so these paths exist.
COPY services/school-springboot/pom.xml ./pom.xml
COPY services/school-springboot/student-service/pom.xml ./student-service/pom.xml
COPY services/school-springboot/student-service/src ./student-service/src

# Build the student-service module only (skip tests for faster local builds)
RUN mvn -B -f student-service/pom.xml -DskipTests package

# runtime image
FROM eclipse-temurin:17-jdk
WORKDIR /app
ARG JAR_FILE=student-service/target/*.jar
COPY --from=build /app/${JAR_FILE} app.jar
# copy the entrypoint that waits for dependencies
COPY services/school-springboot/student-service/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Ensure the Spring Boot app uses the same port we expose and map on the host
ENV SERVER_PORT=8083

EXPOSE 8083
ENTRYPOINT ["./entrypoint.sh"]
