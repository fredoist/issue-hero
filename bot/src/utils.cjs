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

exports.isSpam = async (text) => {
  try {
    const { body: { classifications: [{ confidence, prediction }] } } = await cohere.classify({
      model: 'large',
      inputs: [text],
      examples: [{ text: 'you deserve to be adopted', label: 'Toxic' }, { text: 'Go to Hell', label: 'Toxic' }, { text: 'Looking at your face makes me puke', label: 'Toxic' }, { text: 'Fuck you', label: 'Toxic' }, { text: 'Go back to where you came from - stop stealing our jobs', label: 'Toxic' }, { text: 'I had so much fucking fun last night', label: 'Not Toxic' }, { text: "We have a love-hate relationship but I think we're good friends", label: 'Not Toxic' }, { text: 'That shit tastes so good', label: 'Not Toxic' }, { text: 'You always find a way to brighten my day', label: 'Not Toxic' }, { text: 'I hate the idea of spending time away from you', label: 'Not Toxic' }]
    })
    return prediction === 'Toxic' && confidence > 0.85
  } catch (error) {
    throw new Error(error)
  }
}
