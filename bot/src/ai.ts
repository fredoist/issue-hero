import cohere from 'cohere-ai'
cohere.init(process.env.COHERE_API_KEY as string)

export const filterSpam = async (text: string) => {
  try {
    const result = await cohere.classify({
      model: 'large',
      inputs: [text],
      examples: [
        { text: 'you deserve to be adopted', label: 'Toxic' },
        { text: 'Go to Hell', label: 'Toxic' },
        { text: 'Looking at your face makes me puke', label: 'Toxic' },
        { text: 'Fuck you', label: 'Toxic' },
        { text: 'Go back to where you came from - stop stealing our jobs', label: 'Toxic' },
        { text: 'I had so much fucking fun last night', label: 'Not Toxic' },
        {
          text: "We have a love-hate relationship but I think we're good friends",
          label: 'Not Toxic',
        },
        { text: 'That shit tastes so good', label: 'Not Toxic' },
        { text: 'You always find a way to brighten my day', label: 'Not Toxic' },
        { text: 'I hate the idea of spending time away from you', label: 'Not Toxic' },
      ],
    })

    const { confidence, prediction } = result.body.classifications[0]
    return prediction === 'Toxic' && confidence > 0.85
  } catch (error) {
    throw new Error(error as string)
  }
}

export const summarize = async (text: string) => {
  try {
    const result = await cohere.generate({
      prompt: `Issue: ${text}\n\nTLDR: `,
      model: 'xlarge',
      preset: 'Issue-Summary-msg5zr',
      max_tokens: 100,
    })

    const { text: summary } = result.body.generations[0]
    return summary
  } catch (error) {
    throw new Error(error as string)
  }
}

export const label = async (text: string) => {
  try {
    const result = await cohere.classify({
      inputs: [text],
      model: 'large',
      preset: 'Issue-Labeller-xp8hxd',
    })

    const { labels } = result.body.classifications[0]
    const formattedLabels = Object.entries(labels).map(([label, { confidence }]) => ({
      label,
      confidence,
    }))

    return formattedLabels
  } catch (error) {
    throw new Error(error as string)
  }
}
