<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Dev

1. Copiar el repositorio
2. Instalar dependencias

```
npm run install
```

3. Correr docker

```
docker compose up -d
```

4. Crear los secrets

```
aws secretsmanager create-secret --name auth-secrets --secret-string '{"PORT";"3000","DB_USERNAME";"postgres","DB_PASSWORD";"M1S3Cr37P4s5w0rd","DB_NAME";"AuthDB","JWT_SECRET";"Jw7S3cr3tN357","DB_HOST";"localhost","DB_PORT";"5432","NATS_SERVERS";"nats://localhost:4222*nats://localhost:4223"}' --endpoint-url http://localhost:4566
```

# AWS Secrets Connection

aws configure

Access Key Id: test
Secret Access Key: test
Region: us-east-1
Format: json

# Crear secrets

aws secretsmanager create-secret --name auth-secrets --secret-string '{"PORT";"3000","DB_USERNAME";"postgres","DB_PASSWORD";"M1S3Cr37P4s5w0rd","DB_NAME";"AuthDB","JWT_SECRET";"Jw7S3cr3tN357","DB_HOST";"localhost","DB_PORT";"5432","NATS_SERVERS";"nats://localhost:4222\*nats://localhost:4223"}' --endpoint-url http://localhost:4566

# Actualizar secrets

aws secretsmanager update-secret --secret-id auth-secrets --secret-string '{"PORT";"3000","DB_USERNAME";"postgres","DB_PASSWORD";"M1S3Cr37P4s5w0rd","DB_NAME";"AuthDB","JWT_SECRET";"Jw7S3cr3tN357","DB_HOST";"localhost","DB_PORT";"5432","NATS_SERVERS";"nats://localhost:4222\*nats://localhost:4223"}' --endpoint-url http://localhost:4566

# Listar secrets

aws secretsmanager list-secrets --endpoint-url http://localhost:4566

# Ver secret

aws secretsmanager get-secret-value --secret-id auth-secrets --endpoint-url http://localhost:4566
