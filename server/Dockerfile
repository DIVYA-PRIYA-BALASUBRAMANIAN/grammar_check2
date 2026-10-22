# ==============================================================================
# Zenve Vet High-Performance Spring Boot Dockerfile
# Optimized for JVM G1GC and High Concurrency (Java 21 LTS)
# ==============================================================================

# Build Stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml ./
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install curl for healthcheck probes
RUN apk add --no-cache curl tzdata && \
    cp /usr/share/zoneinfo/UTC /etc/localtime && \
    echo "UTC" > /etc/timezone

# Security: Run as non-privileged system user
RUN addgroup -S zenve && adduser -S zenve -G zenve

COPY --from=builder /app/target/doctor-vet-server-0.0.1-SNAPSHOT.jar app.jar
RUN mkdir -p /app/uploads && chown -R zenve:zenve /app

USER zenve

# High-Concurrency JVM Tuning Flags for 300,000 Users
ENV JAVA_OPTS="-server \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -XX:+ParallelRefProcEnabled \
    -XX:+AlwaysPreTouch \
    -XX:InitiatingHeapOccupancyPercent=45 \
    -XX:G1ReservePercent=15 \
    -XX:G1HeapRegionSize=16m \
    -Xms2048m \
    -Xmx2048m \
    -Djava.security.egd=file:/dev/./urandom \
    -Dfile.encoding=UTF-8"

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
