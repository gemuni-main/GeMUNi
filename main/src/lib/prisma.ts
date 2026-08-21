/**
 * Development data-access client.
 * In production, replace with the actual Prisma/Supabase client generated from the schema.
 * This mock accepts any model + method call so the service layer can be developed
 * against the real interface before the database is provisioned.
 */

type AnyRecord = Record<string, any>

const notFoundError = () => {
  const err = new Error("Record not found")
  err.name = "NotFoundError"
  return err
}

function createModelMock(): AnyRecord {
  return new Proxy({} as AnyRecord, {
    get(_target, method: string) {
      if (method === "findFirst" || method === "findUnique") {
        return async (_args?: AnyRecord) => null
      }
      if (method === "findMany") {
        return async (_args?: AnyRecord) => []
      }
      if (method === "count") {
        return async (_args?: AnyRecord) => 0
      }
      if (method === "aggregate") {
        return async (_args?: AnyRecord) => ({ _sum: {}, _avg: {}, _count: 0 })
      }
      if (method === "create" || method === "update" || method === "upsert") {
        return async (args?: AnyRecord) => ({
          id: `mock_${Math.random().toString(36).slice(2, 10)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...(args?.data ?? {}),
        })
      }
      if (method === "delete") {
        return async (_args?: AnyRecord) => ({ id: "deleted" })
      }
      // Fallback for any other method (groupBy, etc.)
      return async () => null
    },
  })
}

export const prisma = new Proxy({} as AnyRecord, {
  get(_target, model: string) {
    if (!globalThis.__gemuniPrismaModels) {
      globalThis.__gemuniPrismaModels = {} as AnyRecord
    }
    const models = globalThis.__gemuniPrismaModels as AnyRecord
    if (!models[model]) {
      models[model] = createModelMock()
    }
    return models[model]
  },
})

declare global {
  // eslint-disable-next-line no-var
  var __gemuniPrismaModels: AnyRecord | undefined
}
