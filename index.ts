import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import env from '@fastify/env';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from 'fastify-jwt';
import { userRoutes } from './routes/user.routes';
import { errorHandler } from './middlewares/errorHandler';

const server = fastify({ logger: true });

// Env schema
const envSchema = {
  type: 'object',
  required: ['JWT_SECRET', 'HOST', 'PORT'],
  properties: {
    JWT_SECRET: { type: 'string' },
    HOST: { type: 'string' },
    PORT: { type: 'string' },
  },
};

server.register(env, {
  schema: envSchema,
  dotenv: true,
});

server.register(cors);
server.register(helmet);
server.register(sensible);
server.register(swagger, {
  swagger: {
    info: { title: 'API', version: '1.0.0' },
  },
});
server.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});

server.register(jwt, { secret: process.env.JWT_SECRET || 'changeme' });

// Modular routes
server.register(userRoutes, { prefix: '/users' });

// Error handler
server.setErrorHandler(errorHandler);

const start = async () => {
  try {
    await server.listen({ port: Number(process.env.PORT) || 3001, host: process.env.HOST || '0.0.0.0' });
    console.log(`API running on http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3001}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
