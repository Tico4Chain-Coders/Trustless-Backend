import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CLIENT_URL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("👋🏼  Welcome to Trustless Work API")
    .setDescription(
      "Trustless Work is a escrow-as-a-service platform built on Soroban, Stellar's smart contract platform. It is designed to provide secure, transparent, and agile escrow solutions. See our [API Documentation](https://trustless-work.gitbook.io/trustless-work)",
    )
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT || 3000);

  console.log("Now running in: " + process.env.PORT || 3000);
}
bootstrap();
