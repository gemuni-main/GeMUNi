import { inngest } from "@/lib/inngest"

// Research start event - manually create the inngest event
export const researchStarted = async (event: {
  name: string
  data: {
    researchItemId: string
    userId: string
    countryId: string
    committeeId: string
    agendaId: string
    config: any
  }
}) => {
  await inngest.send({
    name: event.name,
    data: event.data,
  })
  return { success: true }
}

// Research progress event
export const researchProgress = async (event: {
  name: string
  data: any
}) => {
  await inngest.send({
    name: event.name,
    data: event.data,
  })
  return { progress: 100 }
}

// Research completed event
export const researchCompleted = async (event: {
  name: string
  data: any
}) => {
  await inngest.send({
    name: event.name,
    data: event.data,
  })
  return { success: true }
}

// Research failed event
export const researchFailed = async (event: {
  name: string
  data: any
}) => {
  await inngest.send({
    name: event.name,
    data: event.data,
  })
  return { failureHandled: true }
}

// Export handler object for Inngest framework compatibility
export const handler = {}