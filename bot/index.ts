import { Context } from 'probot'
import { filterSpam, label, summarize } from './ai'
import { getConfig } from './db'
import { createComment } from './utils'

export const onIssueOpened = async (context: Context<'issues.opened'>) => {
  const { title, body } = context.payload.issue
  const issueContext = `${title.trim()}. ${body?.trim()}`
  try {
    const config = await getConfig(context.payload.repository.full_name)
    const isSpam = config.spam.enabled ? await filterSpam(issueContext) : false
    if (isSpam) {
      const comment = `This issue has been automatically closed due to spam.`
      await context.octokit.issues.createComment(context.issue({ body: comment }))
      await context.octokit.issues.update(context.issue({ state: 'closed' }))
      return
    }
    const summary = config.summary.enabled ? await summarize(issueContext) : null
    const suggestedLabels = config.label.enabled ? await label(issueContext) : []
    const comment = createComment({ summary, labels: suggestedLabels })
    await context.octokit.issues.createComment(context.issue({ body: comment }))
    if (suggestedLabels.length > 0) {
      await context.octokit.issues.addLabels(
        context.issue({ labels: suggestedLabels.map(({ label }) => label) })
      )
    }
  } catch (error) {
    if (error) {
      await context.octokit.issues.createComment(
        context.issue({ body: (error as any).message || error })
      )
      throw new Error(error as string)
    }
  }
}
