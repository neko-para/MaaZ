export function serializeSet<V>(s: Set<V>) {
  return s.values()
}

export function deserializeSet<V>(a: V[]) {
  return new Set(a)
}

export function serializeMap<V>(m: Map<string, V>) {
  return Object.fromEntries(m.entries())
}

export function deserializeMap<V>(o: Record<string, V>) {
  return new Map<string, V>(Object.entries(o))
}
