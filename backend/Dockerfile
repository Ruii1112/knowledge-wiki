# syntax=docker/dockerfile:1.7
FROM eclipse-temurin:25-jdk

WORKDIR /app

COPY . /app

RUN chmod +x ./gradlew

EXPOSE 8080

CMD ["./gradlew", "bootRun", "--no-daemon"]
