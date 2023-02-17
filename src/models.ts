import cohere from 'cohere-ai'
import type { Context } from 'probot'
import type { Config } from './config'
cohere.init(process.env.COHERE_API_KEY as string)

export async function createSummary(
  context: Context<'issues.opened'>,
  config: Config
): Promise<string | null> {
  if (!config?.summary.enabled) return null
  const { title, body } = context.payload.issue
  const input = body ?? title
  const result = await cohere.generate({
    model: 'command-xlarge-nightly',
    preset: 'Issue-Summary-Command-sgyrr0',
    prompt: input,
    max_tokens: config.summary.threshold,
  })

  const { text } = result.body.generations[0]
  return text
}

export async function filterSpam(
  context: Context<'issues.opened'>,
  config: Config
): Promise<boolean> {
  if (!config?.spam.enabled) return false
  const { title, body } = context.payload.issue
  const input = body ?? title
  const result = await cohere.classify({
    model: process.env.SPAM_DETECTION_MODEL as string,
    inputs: [input],
    examples: [],
  })

  const { prediction, confidence } = result.body.classifications[0]
  return prediction === 'spam' && confidence > config.spam.confidence
}

export async function addLabels(
  context: Context<'issues.opened'>,
  config: Config
): Promise<string[] | null> {
  if (!config?.label.enabled) return null
  const { title, body } = context.payload.issue
  const input = body ?? title
  const result = await cohere.classify({
    model: process.env.ISSUE_LABEL_MODEL as string,
    inputs: [input],
    examples: [],
  })

  const { labels } = result.body.classifications[0]
  const suggestedLabels = Object.entries(labels)
    .map(([label, { confidence }]) => {
      if (confidence > config.label.confidence) return label
      return null
    })
    .filter(Boolean) as string[]

  return suggestedLabels
}
