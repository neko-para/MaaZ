type DebugCreateService = () => Promise<string | null>

export const service: Record<string, { create: DebugCreateService }> = {}
