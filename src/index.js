const { Probot, Context } = require('probot') // eslint-disable-line no-unused-vars
const cohere = require('cohere-ai')
cohere.init(process.env.COHERE_API_KEY)

/**
 * App entry point
 * @param {Probot} app
 */
module.exports = (app) => {
  app.on('issues.opened', async (context) => {
    const { title, body, labels } = context.payload.issue
    const { private: isPrivate } = context.payload.repository
    if (isPrivate) {
      return context.createComment({
        context,
        body: 'Issue Hero is not available for private repositories'
      })
    }
    try {
      const isSpam = await spamFilter({ title, body })
      if (isSpam) {
        return createComment({
          context,
          body: 'Issue Hero thinks this issue is spam'
        })
      }
      const summary = await summarize({ title, body })
      const labelSuggestions = await label({ title, body, labels })
      createComment({
        context,
        body: `TLDR: ${summary}`
      })
      await context.octokit.issues.addLabels(context.issue({
        labels: [...new Set([...labels, ...labelSuggestions])]
      }))
    } catch (error) {
      app.log.error(error)
    }
  })
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
 * @param {string} props.title - The title of the issue
 * @param {string} props.body - The body of the issue
 * @returns {Promise<string>}
 */
async function summarize ({ title, body }) {
  const result = await cohere.generate({
    prompt: `${title}\n${body}`,
    max_tokens: 100,
    model: 'xlarge',
    preset: 'Issue-Summary-msg5zr'
  })
  const { text } = result.body.generations[0]
  return text
}

/**
 * Check if the issue is spam
 * @param {Object} props
 * @param {string} props.title - The title of the issue
 * @param {string} props.body - The body of the issue
 * @returns {Promise<boolean>}
 */
async function spamFilter ({ title, body }) {
  const result = await cohere.classify({
    model: 'large',
    inputs: [`${title}\n${body}`],
    preset: 'Product-Review-Sentiment-kdtu14'
  })
  const { confidence, prediction } = result.body.classifications[0]
  return confidence > 0.85 && prediction === 'negative'
}

/**
 * Get AI label suggestions for the issue
 * @param {Object} props
 * @param {string} props.title - The title of the issue
 * @param {string} props.body - The body of the issue
 * @param {string[]} props.labels - The labels of the issue
 * @returns {Promise<string[]>}
 */
async function label ({ title, body, labels }) {
  const result = await cohere.classify({
    inputs: [`${title}\n${body}`],
    model: 'large',
    preset: 'Issue-Labeller-xp8hxd'
  })

  const { labels: suggestions } = result.body.classifications[0]
  return Object.entries(suggestions).map(([label, { confidence }]) => {
    return confidence > 0.85 ? label : null
  }).filter(Boolean)
}