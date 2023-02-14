type Config = {
  summary: {
    enabled: boolean
    threshold: number
  }
  spam: {
    enabled: boolean
    confidence: number
    close: boolean
    notify: string[]
  }
  label: {
    enabled: boolean
    confidence: number
  }
}

export const defaultConfig: Config = {
  summary: {
    enabled: true,
    threshold: 300,
  },
  spam: {
    enabled: true,
    confidence: 0.85,
    close: true,
    notify: [],
  },
  label: {
    enabled: true,
    confidence: 0.85,
  },
}
