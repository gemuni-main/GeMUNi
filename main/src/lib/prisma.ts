/**
 * Development data-access client backed by an in-memory store.
 * Mirrors the Prisma/Supabase client surface used by the service layer so
 * routes behave consistently locally (create -> read -> update persist within
 * the server process). Swap for the generated Prisma client in production.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type AnyRecord = Record<string, any>
type Row = AnyRecord & { id: string }

interface Collection {
  rows: Map<string, Row>
  seq: number
}

const store: Map<string, Collection> = new Map()

function collection(model: string): Collection {
  let col = store.get(model)
  if (!col) {
    col = { rows: new Map(), seq: 0 }
    store.set(model, col)
  }
  return col
}

function matches(row: Row, where?: AnyRecord): boolean {
  if (!where) return true
  for (const [key, cond] of Object.entries(where)) {
    if (cond === null || cond === undefined) continue

    if (typeof cond === "object" && !Array.isArray(cond)) {
      const value = row[key]
      if (value === undefined) return false
      const comparable =
        value instanceof Date ? value.getTime() : typeof value === "number" ? value : Date.parse(value)
      if (!Number.isFinite(comparable)) return false
      if (cond.gte !== undefined && comparable < asTime(cond.gte)) return false
      if (cond.lte !== undefined && comparable > asTime(cond.lte)) return false
      continue
    }

    if (row[key] !== cond) return false
  }
  return true
}

function asTime(v: unknown): number {
  if (v instanceof Date) return v.getTime()
  if (typeof v === "number") return v
  return Date.parse(String(v))
}

function clone<T>(value: T): T {
  return value instanceof Date ? (new Date(value.getTime()) as unknown as T) : structuredClone(value)
}

function notFound(model: string): Error {
  const err = new Error(`${model} record not found`)
  err.name = "NotFoundError"
  return err
}

interface ModelMock {
  create(args?: { data?: AnyRecord }): Promise<Row>
  findUnique(args?: { where?: AnyRecord }): Promise<Row | null>
  findFirst(args?: { where?: AnyRecord }): Promise<Row | null>
  findMany(args?: { where?: AnyRecord; orderBy?: AnyRecord }): Promise<Row[]>
  count(args?: { where?: AnyRecord }): Promise<number>
  aggregate(args?: AnyRecord): Promise<AnyRecord>
  update(args?: { where?: AnyRecord; data?: AnyRecord }): Promise<Row>
  upsert(args?: { where?: AnyRecord; data?: AnyRecord }): Promise<Row>
  delete(args?: { where?: AnyRecord }): Promise<Row>
}

function createModelMock(model: string): ModelMock {
  const col = collection(model)

  async function findOne(where?: AnyRecord): Promise<Row | null> {
    for (const row of Array.from(col.rows.values())) {
      if (matches(row, where)) return clone(row)
    }
    return null
  }

  return {
    async create({ data }: { data?: AnyRecord } = {}) {
      const id = `dev_${(++col.seq).toString(36)}_${Math.random().toString(36).slice(2, 8)}`
      const row = { id, createdAt: new Date(), updatedAt: new Date(), ...(data ?? {}) } as Row
      col.rows.set(id, row)
      return clone(row)
    },

    findUnique: findOne,
    findFirst: findOne,

    async findMany({ where, orderBy }: { where?: AnyRecord; orderBy?: AnyRecord } = {}) {
      let out = Array.from(col.rows.values()).filter((r) => matches(r, where))
      if (orderBy) {
        const key = Object.keys(orderBy)[0]
        const dir = orderBy[key] === "desc" ? -1 : 1
        out.sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0))
      }
      return out.map(clone)
    },

    async count({ where }: { where?: AnyRecord } = {}) {
      return Array.from(col.rows.values()).filter((r) => matches(r, where)).length
    },

    async aggregate() {
      return { _sum: {}, _avg: {}, _count: col.rows.size }
    },

    async update({ where, data }: { where?: AnyRecord; data?: AnyRecord } = {}) {
      for (const [id, row] of Array.from(col.rows.entries())) {
        if (matches(row, where)) {
          const updated = { ...row, ...(data ?? {}), updatedAt: new Date() } as Row
          col.rows.set(id, updated)
          return clone(updated)
        }
      }
      throw notFound(model)
    },

    async upsert({ where, data }: { where?: AnyRecord; data?: AnyRecord } = {}) {
      const existing = await findOne(where)
      if (existing) {
        return this.update({ where: { id: existing.id }, data })
      }
      return this.create({ data })
    },

    async delete({ where }: { where?: AnyRecord } = {}) {
      for (const [id, row] of Array.from(col.rows.entries())) {
        if (matches(row, where)) {
          col.rows.delete(id)
          return clone(row)
        }
      }
      throw notFound(model)
    },
  }
}

export const prisma = new Proxy({} as Record<string, ModelMock>, {
  get(_target, model: string) {
    return createModelMock(String(model))
  },
})
