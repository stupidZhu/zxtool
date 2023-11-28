class IntersectionObserverHelper {
  intersectionObserver: IntersectionObserver
  cbCollection = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>()

  constructor(options?: IntersectionObserverInit) {
    this.intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          this.cbCollection.get(entry.target)?.(entry)
        })
      },
      { threshold: 1, ...options },
    )
  }
}

export default IntersectionObserverHelper
