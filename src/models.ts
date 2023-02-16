import cohere from 'cohere-ai'
import { Context } from 'probot'
import { defaultConfig } from './config'
cohere.init(process.env.COHERE_API_KEY as string)

export async function createSummary(context: Context<'issues.opened'>): Promise<void> {
  const config = await context.config('issue-hero.yml', defaultConfig)
  if (config?.summary.enabled) {
    const { title, body } = context.payload.issue
    const input = body ?? title
    const result = await cohere.generate({
      model: 'command-xlarge-nightly',
      preset: 'Issue-Summary-Command-sgyrr0',
      prompt: input,
      max_tokens: config.summary.threshold,
    })

    const { text: summary } = result.body.generations[0]
    const comments = await context.octokit.issues.listComments(context.issue())
    const existingComment = comments.data.filter(
      (comment) => comment.user?.login === 'issue-hero[bot]'
    )
    if (existingComment.length) {
      const comment = context.issue({ body: `TLDR: ${summary}`, comment_id: existingComment[0].id })
      await context.octokit.issues.updateComment(comment)
      return Promise.resolve()
    }
    const comment = context.issue({ body: `TLDR: ${summary}` })
    await context.octokit.issues.createComment(comment)
  }
  return Promise.resolve()
}

export async function filterSpam(context: Context<'issues.opened'>): Promise<void> {
  const config = await context.config('issue-hero.yml', defaultConfig)
  if (config?.spam.enabled) {
    const { title, body } = context.payload.issue
    const input = body ?? title
    const result = await cohere.classify({
      model: process.env.SPAM_DETECTION_MODEL as string,
      inputs: [input],
      examples: [],
    })

    const { prediction, confidence } = result.body.classifications[0]
    if (prediction === 'spam' && confidence > config.spam.confidence) {
      const maintainers = config.spam.notify.map((user) => `@${user}`).join(' ')

      const comments = await context.octokit.issues.listComments(context.issue())
      const existingComment = comments.data.filter(
        (comment) => comment.user?.login === 'issue-hero[bot]'
      )
      if (existingComment.length) {
        const comment = context.issue({
          body: `This issue has been flagged as spam. If you believe this is a mistake, please contact the maintainers of this repository.\n\n${maintainers}`,
          comment_id: existingComment[0].id,
        })
        await context.octokit.issues.updateComment(comment)
        return Promise.reject('Issue flagged as spam')
      }
      const comment = context.issue({
        body: `This issue has been flagged as spam. If you believe this is a mistake, please contact the maintainers of this repository.\n\n${maintainers}`,
      })
      await context.octokit.issues.createComment(comment)
      if (config.spam.close) await context.octokit.issues.update(context.issue({ state: 'closed' }))
      return Promise.reject('Issue flagged as spam')
    }
  }
  return Promise.resolve()
}

export async function addLabels(context: Context<'issues.opened'>): Promise<void> {
  const config = await context.config('issue-hero.yml', defaultConfig)
  if (config?.label.enabled) {
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

    const comments = await context.octokit.issues.listComments(context.issue())
    const existingComment = comments.data.filter(
      (comment) => comment.user?.login === 'issue-hero[bot]'
    )
    if (existingComment.length) {
      const comment = context.issue({
        body: `${existingComment[0].body}\n\nI have added the following labels to this issue: ${suggestedLabels.join(', ')}`,
        comment_id: existingComment[0].id,
      })
      await context.octokit.issues.updateComment(comment)
      return Promise.resolve()
    }

    await context.octokit.issues.addLabels(context.issue({ labels: suggestedLabels }))
  }
  return Promise.resolve()
}
