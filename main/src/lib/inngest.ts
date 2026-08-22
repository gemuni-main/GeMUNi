/**
 * Development Inngest stub.
 * Accepts a single event ({ name, data }) or an array of events and records
 * them for local observation. Swap for the real Inngest SDK in production.
 */

export interface InngestEvent {
  name: string
  data: Record<string, unknown>
}

const recentEvents: InngestEvent[] = []

export function createInngest(_name: string) {
  return {
    async send(eventOrEvents: InngestEvent | InngestEvent[]) {
      const events = Array.isArray(eventOrEvents) ? eventOrEvents : [eventOrEvents]
      for (const event of events) {
        recentEvents.push(event)
        // Structured, secret-free observability line
        console.log(JSON.stringify({ level: "info", msg: "job_event", event: event.name }))
      }
      return { ids: events.map((_, i) => `local_${Date.now()}_${i}`) }
    },
  }
}

export function recentJobEvents(): readonly InngestEvent[] {
  return recentEvents
}

export const inngest = createInngest("GeMUNi")