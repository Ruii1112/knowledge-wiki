# syntax=docker/dockerfile:1.7
FROM eclipse-temurin:25-jdk

WORKDIR /app

COPY backend /app/backend
COPY migration /app/migration

WORKDIR /app/backend

RUN sed -i 's/\r$//' ./gradlew
RUN chmod +x ./gradlew


EXPOSE 8080

CMD ["./gradlew", "bootRun", "--no-daemon"]
