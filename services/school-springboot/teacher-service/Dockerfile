FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app
COPY services/school-springboot/teacher-service/pom.xml ./pom.xml
COPY services/school-springboot/teacher-service/src ./src
RUN mvn -B -DskipTests -Dcheckstyle.skip=true -Dmaven.wagon.http.retryHandler.count=3 package

FROM eclipse-temurin:17-jdk
WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY --from=build /app/${JAR_FILE} app.jar
EXPOSE 8085
ENTRYPOINT ["java","-jar","/app/app.jar"]
