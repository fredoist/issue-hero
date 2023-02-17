import type { Probot } from 'probot'
import type { Config } from './config'
import { defaultConfig } from './config'
import { addLabels, createSummary, filterSpam } from './models'

export default (app: Probot) => {
  app.on('issues.opened', async (context) => {
    const { private: isPrivateRepo } = context.payload.repository
    if (isPrivateRepo) return
    try {
      const config = (await context.config('issue-hero.yml', defaultConfig)) as Config

      const isSpam = await filterSpam(context, config)
      if (isSpam) {
        const maintainers = config.spam.notify.map((u) => `@${u}`).join(', ')
        const spamContext =
          'This issue has been flagged as spam. If you believe this is an error, please contact the maintainers.'
        const notifyContext = maintainers ? `Please notify ${maintainers}.` : ''
        const comment = context.issue({ body: [spamContext, notifyContext].join('\n\n') })
        await context.octokit.issues.createComment(comment)
        if (config.spam.close)
          await context.octokit.issues.update(context.issue({ state: 'closed' }))
        return
      }

      const summary = await createSummary(context, config)
      const suggestedLabels = await addLabels(context, config)
      const labels = suggestedLabels?.map(({ label }) => label)

      const summaryContext = summary ? `### TLDR:\n\n${summary}` : ''
      const labelsWithConfidence = suggestedLabels?.map(
        ({ label, confidence }) => `${label}\`${confidence * 100}%\``
      )
      const labelsContext = labels?.length
        ? `The following labels have been added based on issue context:\n${labelsWithConfidence?.join(
            ', '
          )}`
        : ''
      const comment = context.issue({ body: [summaryContext, labelsContext].join('\n\n') })
      if (comment) await context.octokit.issues.createComment(comment)
      if (labels) await context.octokit.issues.addLabels(context.issue({ labels }))
      return
    } catch (error) {
      return error && context.log.error(error)
    }
  })
}
