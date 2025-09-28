FROM maven:3.8-openjdk-17

WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline

COPY src ./src

RUN mvn clean package -DskipTests

EXPOSE 8081

CMD ["java", "-jar", "target/aegis-bank-backend-0.0.1-SNAPSHOT.jar"]

