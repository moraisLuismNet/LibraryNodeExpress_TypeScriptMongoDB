import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import bookRoutes from "./routes/bookRoutes";
import publishinHouseRoutes from "./routes/publishingHouseRoutes";
import authorRoutes from "./routes/authorRoutes";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";

// Swagger configuration
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LibraryNodeExpress_TypeScriptMongoDB API',
      version: '1.0.0',
      description: 'API documentation for Library Management System',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// Serving static files from the 'uploads' folder
app.use('/uploads', express.static('uploads'));

app.use("/books", bookRoutes);
app.use("/publishingHouses", publishinHouseRoutes);
app.use("/authors", authorRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

// Setup Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

export default app;
