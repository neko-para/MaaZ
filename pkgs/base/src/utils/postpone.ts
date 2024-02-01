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
