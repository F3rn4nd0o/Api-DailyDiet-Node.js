import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'

export async function userRoutes(app: FastifyInstance) {
  // Users
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    await knex('user').insert({
      id: randomUUID(),
      name,
      email,
    })
    return reply.status(201).send()
  })

  app.get('/', async (request) => {
    const User = await knex('user').select()

    return { User }
  })
}
