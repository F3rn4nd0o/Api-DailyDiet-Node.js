import { env } from './env'
import { app } from './app'
import fastifyCors from '@fastify/cors'

app.register(fastifyCors)

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP server running')
  })
