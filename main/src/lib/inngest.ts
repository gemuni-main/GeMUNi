/// <reference types="next" />

// Mock Inngest for development without the external package
// In production, replace with: import { createInngest } from "@inngest/nextjs"

let inngestInstance: any

export function createInngest(name: string) {
  if (!inngestInstance) {
    inngestInstance = {
      send: async (events: any) => {
        console.log(`Inngest: sending event ${events[0].name}`, events)
        return { status: "accepted" }
      },
    }
  }
  return inngestInstance
}

export const inngest = createInngest("GeMUNi")