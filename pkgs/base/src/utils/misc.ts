export function postpone(push: () => void, pop: () => void) {
  return () => {
    push()
    return {
      [Symbol.dispose]() {
        pop()
      }
    }
  }
}

export function diff<T>(newer: T[], older: T[], pred: (x: T, y: T) => boolean = (a, b) => a === b) {
  const both: T[] = []
  const newOnly: T[] = []
  const rest = [...older]
  for (const newv of newer) {
    const index = rest.findIndex(v => pred(newv, v))
    if (index === -1) {
      newOnly.push(newv)
    } else {
      both.push(newv)
      rest.splice(index, 1)
    }
  }
  return {
    both,
    newOnly,
    oldOnly: rest
  }
}
