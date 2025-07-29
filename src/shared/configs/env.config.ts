import { ErrorException } from "@dolphjs/dolph/common";
import Joi from "joi";

const envSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .description("current app environment")
      .default("development"),
    JWT_SECRET_KEY: Joi.string()
      .description("JWT secret key")
      .default("secretkeyisverysecret"),
    JWT_ACCESS_EXPIRATION_DEV: Joi.string()
      .description("access duration")
      .default("200"),
    JWT_ACCESS_EXPIRATION_PROD: Joi.string()
      .description("access duration")
      .default("50"),
    SMTP_USER_DEV: Joi.string().description("SMTP dev username").required(),
    SMTP_PASS_DEV: Joi.string().description("SMTP dev password").required(),
    SMTP_SERVICE_DEV: Joi.string()
      .description("SMTP dev service")
      .default("gmail"),
    SMTP_USER_PROD: Joi.string().description("SMTP prod username"),
    SMTP_PASS_PROD: Joi.string().description("SMTP prod password"),
    SMTP_SERVICE_PROD: Joi.string().description("SMTP prod service"),
    MONGO_URL: Joi.string().description("MONGO Connection string").required(),
    CIRCLE_KEY_DEV: Joi.string().description("Circle APi Key").required(),
    CIRCLE_KEY_PROD: Joi.string().description("Circle APi Key"),
    SOLANA_PRIVATE_KEY: Joi.string()
      .description("Solana private key")
      .required(),
    CIRCLE_ENTITY_KEY: Joi.string()
      .description(
        "Entity key to manage signing of requests and managing accounts"
      )
      .required(),
  })
  .unknown();

const { value: envVars, error } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error)
  throw new ErrorException(`Configs Load Error: ${error.message}`, 500);

export default {
  env: envVars.NODE_ENV,
  jwt: {
    secret: envVars.JWT_SECRET_KEY,
    accessDuration:
      envVars.NODE_ENV === "development"
        ? envVars.JWT_ACCESS_EXPIRATION_DEV
        : envVars.JWT_ACCESS_EXPIRATION_PROD,
  },
  smtp: {
    service:
      envVars.NODE_ENV === "development"
        ? envVars.SMTP_SERVICE_DEV
        : envVars.SMTP_SERVICE_PROD,
    user:
      envVars.NODE_ENV === "development"
        ? envVars.SMTP_USER_DEV
        : envVars.SMTP_USER_PROD,
    pass:
      envVars.NODE_ENV === "development"
        ? envVars.SMTP_PASS_DEV
        : envVars.SMTP_PASS_PROD,
  },
  mongo: {
    url: envVars.MONGO_URL,
  },
  circle: {
    apiKeyTest: envVars.CIRCLE_KEY_DEV,
    apiKeyProd: envVars.CIRCLE_KEY_PROD,
    entityKey: envVars.CIRCLE_ENTITY_KEY,
  },
  solana: {
    key: envVars.SOLANA_PRIVATE_KEY,
  },
  app: {
    url: "http://localhost:3003",
  },
};

export const isDev = () => envVars.NODE_ENV === "development";
export const isProd = () => envVars.NODE_ENV === "production";
