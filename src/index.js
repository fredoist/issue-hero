const { Probot, Context } = require('probot') // eslint-disable-line no-unused-vars
const cohere = require('cohere-ai')
const { parse } = require('yaml')
cohere.init(process.env.COHERE_API_KEY)

/**
 * App entry point
 * @param {Probot} app
 */
module.exports = (app) => {
  app.on('issues.opened', async (context) => {
    const { title, body, labels } = context.payload.issue
    const { owner: { login: owner }, name: repo } = context.payload.repository
    const { private: isPrivate } = context.payload.repository
    if (isPrivate) {
      return createComment({
        context,
        body: 'Issue Hero is not available for private repositories'
      })
    }
    try {
      const config = await getConfig({ context, owner, repo })
      if (config.spam.enabled) {
        const isSpam = await spamFilter({ title, body, confidence: config.spam.confidence })
        if (isSpam) {
          return createComment({
            context,
            body: 'Issue Hero thinks this issue is spam'
          })
        }
      }
      if (config.summary.enabled) {
        const summary = body.length > 0 ? await summarize({ body, threshold: config.summary.threshold }) : title
        createComment({
          context,
          body: `TLDR: ${summary}`
        })
      }
      if (config.label.enabled) {
        const suggestedLabels = await label({ body, labels, confidence: config.label.confidence })
        await context.octokit.issues.addLabels(context.issue({ labels: suggestedLabels }))
      }
    } catch (error) {
      app.log.error(error)
    }
  })
}

/**
 * @typedef Config
 * @property {Object} summary
 * @property {boolean} summary.enabled
 * @property {number} summary.threshold
 * @property {Object} label
 * @property {boolean} label.enabled
 * @property {number} label.confidence
 * @property {Object} spam
 * @property {boolean} spam.enabled
 * @property {number} spam.confidence
 * @property {string[]} spam.notify
 */
/**
 * Get the configuration for the repository
 * @param {Object} props
 * @param {Context<'issues.opened'>} props.context - The context of the issue
 * @param {string} props.owner - The owner of the repository
 * @param {string} props.repo - The name of the repository
 * @returns {Promise<Config>}
 */
async function getConfig ({ context, owner, repo }) {
  const defaultConfig = {
    summary: {
      enabled: true,
      threshold: 100
    },
    label: {
      enabled: true,
      confidence: 0.85
    },
    spam: {
      enabled: true,
      confidence: 0.85,
      notify: []
    }
  }
  const { data: { content } } = await context.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner,
    repo,
    path: 'issue-hero.yml'
  })
  return content ? parse(Buffer.from(content, 'base64').toString()) : defaultConfig
}

/**
 * Create a comment on the issue
 * @param {Object} props
 * @param {Context<'issues.opened'>} props.context - The context of the issue
 * @param {string} props.body - The body of the comment
 * @returns {Promise<void>}
 */
function createComment ({ context, body }) {
  return context.octokit.issues.createComment(context.issue({ body }))
}

/**
 * Generate an AI summary of the issue
 * @param {Object} props
 * @param {string} props.body - The body of the issue
 * @returns {Promise<string>}
 */
async function summarize ({ body, threshold }) {
  const result = await cohere.generate({
    prompt: body,
    max_tokens: threshold,
    model: 'command-xlarge-nightly',
    preset: 'Issue-Summary-Command-sgyrr0'
  })
  const { text } = result.body.generations[0]
  return text
}

/**
 * Check if the issue is spam
 * @param {Object} props
 * @param {string} props.body - The body of the issue
 * @returns {Promise<boolean>}
 */
async function spamFilter ({ body, confidence }) {
  const result = await cohere.classify({
    model: process.env.SPAM_DETECTION_MODEL,
    inputs: [body]
  })
  const { confidence: aiConfidence, prediction } = result.body.classifications[0]
  return aiConfidence > confidence && prediction === 'spam'
}

/**
 * Get AI label suggestions for the issue
 * @param {Object} props
 * @param {string} props.body - The body of the issue
 * @param {string[]} props.labels - The labels of the issue
 * @returns {Promise<string[]>}
 */
async function label ({ body, labels, confidence }) {
  const result = await cohere.classify({
    inputs: [body],
    model: process.env.ISSUE_LABEL_MODEL
  })

  const { labels: suggestions } = result.body.classifications[0]
  const suggestedLabels = Object.entries(suggestions).map(([label, { confidence: aiConfidence }]) => {
    return aiConfidence > confidence ? label : null
  }).filter(Boolean)
  return [...new Set([...labels, ...suggestedLabels])]
}
