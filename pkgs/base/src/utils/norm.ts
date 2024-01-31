export function normSet<V>(s: Set<V>) {
  return s.values()
}

export function denormSet<V>(a: V[]) {
  return new Set(a)
}

export function normMap<V>(m: Map<string, V>) {
  return Object.fromEntries(m.entries())
}

export function denormMap<V>(o: Record<string, V>) {
  return new Map<string, V>(Object.entries(o))
}
