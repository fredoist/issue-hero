const { createClient } = require('redis')
const redis = createClient({ url: process.env.REDIS_URL })
exports.redis = redis

/**
 * A function that returns a formatted comment string according to given params.
 *
 * @param {string} summary - The AI generated summary of the issue
 * @param {{label: string, confidence: number}[]} labels - The array of AI classified labels
 * @param {boolean} flagged - Wheter if the issue is marked as spam or toxic
 * @param {Config} config - The config object
 * @return {string} - The comment formatted string
 */
exports.createComment = (summary, labels, flagged, config) => {
  const { summarize, spam } = config

  const formattedLabels = labels
    .map(({ label, confidence }) => {
      const percentage = (confidence * 100).toFixed(2)
      return `${label} (\`${percentage}%\`)`
    })
    .join(', ')

  const summaryCtx = summarize ? `TLDR: ${summary}` : ''
  const labelsCtx = `The following labels have been added based on issue context:\n\n${formattedLabels}`
  const spamCtx = 'This issue has been marked as spam and will be closed.'
  const feedbackCtx = `Please rate this response by reacting with :+1: or :-1: to this comment. You can also provide feedback in [our repository](https://github.com/fredoist/issue-hero/issues/new)`

  if (flagged && spam.enabled) {
    return `${spamCtx}\n\nWe'll notify maintainers to review this issue: @${spam.notify}\n\n---\n\n${feedbackCtx}`
  }

  return `${summaryCtx}\n\n${labelsCtx}\n\n---\n\n${feedbackCtx}`
}

/**
 * @typedef {object} Config
 * @property {boolean} summarize - Whether to summarize the issue
 * @property {object} spam - The spam config
 * @property {boolean} spam.enabled - Whether to check for spam
 * @property {string} spam.notify - The user to notify when an issue is marked as spam
 */

/**
 * Get the config from redis
 * @param {string} repo - the repo name with user
 * @returns {Promise<Config>} - The config object
 */
exports.getConfig = async (repo) => {
  try {
    const config = await redis.get(repo)
    return JSON.parse(config)
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Save the config to redis
 * @param {string} repo - the repo name with user
 * @param {Config} config - the config object
 * @returns {Promise<Config>} - The config object
 */
exports.saveConfig = async (repo, config) => {
  try {
    await redis.set(repo, JSON.stringify(config))
    return config
  } catch (error) {
    throw new Error(error)
  }
}
