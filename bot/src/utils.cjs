const cohere = require('cohere-ai')
cohere.init(process.env.COHERE_API_KEY)

/**
 * A function that takes in a text and returns a summary of the text.
 * @param {string} text - The text to summarize
 * @returns {Promise<string>} - The summary of the text
 */
exports.summarize = async (text) => {
  try {
    const { body: { generations: [{ text: summary }] } } = await cohere.generate({
      model: 'xlarge',
      prompt: text,
      max_tokens: 40,
      temperature: 0.3,
      stop_sequences: ['--'],
      p: 0.75,
      frequency_penalty: 0.5,
      presence_penalty: 0.1,
      preset: 'Issue-Summary-sgyrr0'
    })
    return summary
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * A function that takes in a text and returns an array of labels.
 * @param {string} context - The context of the issue
 * @returns {Promise<{label: string, confidence: number}[]>} - The labels of the issue
 */
exports.label = async (context) => {
  try {
    const { body: { classifications: [{ labels }] } } = await cohere.classify({
      model: 'large',
      inputs: [context],
      preset: 'Issue-Labeller-xp8hxd'
    })
    return Object.entries(labels).map(([label, { confidence }]) => ({ label, confidence })).filter(({ confidence }) => confidence > 0.85)
  } catch (error) {
    throw new Error(error)
  }
}
