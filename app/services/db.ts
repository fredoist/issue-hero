import { createClient } from 'redis'

const client = createClient({
  url: process.env.REDIS_URL,
})

export interface Config {
  summary: {
    enabled: boolean
    lenght?: number
  }
  label: {
    enabled: boolean
    labels?: string[]
  }
  spam: {
    enabled: boolean
    administrators?: string[]
    threshold?: number
  }
}

const defaultConfig: Config = {
  summary: {
    enabled: true,
    lenght: 100,
  },
  label: {
    enabled: true,
  },
  spam: {
    enabled: true,
    administrators: [],
    threshold: 0.85,
  },
}

export const getConfig = async (repo: string): Promise<Config> => {
  try {
    const config = await client.get(repo)
    return config ? JSON.parse(config) : defaultConfig
  } catch (error) {
    throw new Error(error as string)
  }
}

export const setConfig = async (repo: string, config: Config = defaultConfig): Promise<Config> => {
  try {
    await client.set(repo, JSON.stringify(config))
    return config
  } catch (error) {
    throw new Error(error as string)
  }
}

export const getRepos = async (user: string): Promise<string[]> => {
  try {
    const repos = await client.get(user)
    return repos ? JSON.parse(repos) : []
  } catch (error) {
    throw new Error(error as string)
  }
}

export default client
