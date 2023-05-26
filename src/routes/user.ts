import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExist } from '../../middlewares/check-session-id-exist'

export async function userRoutes(app: FastifyInstance) {
  // Users
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    })

    const { name } = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('user').insert({
      id: randomUUID(),
      name,
      session_id: sessionId,
    })
    return reply.status(201).send()
  })

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const User = await knex('user').where('session_id', sessionId).select()
      const Meals = await knex('meal').where('session_id', sessionId).select()

      return { User, Meals }
    },
  )

  // Meals
  app.post('/meal', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      hour: z.string(),
      type: z.enum(['yes', 'no']),
    })

    const { name, description, date, hour, type } = createMealBodySchema.parse(
      request.body,
    )

    const sessionId = request.cookies.sessionId

    await knex('meal').insert({
      id: randomUUID(),
      name,
      description,
      date,
      hour,
      itsontheDiet: type,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get(
    '/meal',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const User = await knex('user').where('session_id', sessionId).select()
      const Meals = await knex('meal').where('session_id', sessionId).select()

      return { User, Meals }
    },
  )

  app.get(
    '/meal/:id',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const Meal = await knex('meal')
        .where({
          session_id: sessionId,
          id,
        })
        .first()

      return { Meal }
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const Totalnumberofregisteredmeals = (
        await knex('meal').where('session_id', sessionId)
      ).length

      // const Totalamountofmealswithinthediet =

      // const Totalnumberofmealsoutsidethediet =

      return {
        Totalnumberofregisteredmeals,
      }
    },
  )

  app.put('/meal/update/:id', async (request, reply) => {
    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      hour: z.string(),
      type: z.enum(['yes', 'no']),
    })

    const UpdateMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = UpdateMealParamsSchema.parse(request.params)

    const { name, description, date, hour, type } = updateMealBodySchema.parse(
      request.body,
    )

    await knex
      .where({ id })
      .update({ name, description, date, hour, itsontheDiet: type })
      .table('meal')

    return reply.status(200).send('successfully update meal')
  })

  app.delete('/meal/delete/:id', async (request, reply) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)

    await knex.where({ id }).delete().table('meal')

    return reply.status(200).send('successfully deleted meal')
  })
}
