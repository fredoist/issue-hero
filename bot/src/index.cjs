const { summarize, label, isSpam } = require('./utils.cjs')

/**
 * App entry point
 * @param {import('probot').Probot} app - The Probot context
 *
 * @todo Add support for assignees
 * @todo Add support for custom settings
 * @todo Add support for duplicated issues
 */
module.exports = (app) => {
  app.log('Yay, the app was loaded!')
  app.on('issues.opened', async (context) => {
    const { title, body, labels: currentLabels, assignees: currentAssignees } = context.payload.issue // eslint-disable-line no-unused-vars

    try {
      const isToxic = await isSpam(`${title.trim()}. ${body.trim()}`)

      if (isToxic) {
        app.log('Spam detected')
        await context.octokit.issues.createComment(context.issue({ body: 'This issue has been marked as spam and will be closed.' }))
        await context.octokit.issues.update(context.issue({ state: 'closed' }))
        return
      }
      const summary = await summarize(`${title.trim()}. ${body.trim()}`)
      const labels = await label(body)

      const commentBody = `TLDR: ${summary}

---

We suggest the following labels based on the issue content:
${labels.map(({ label, confidence }) => `- ${label} (\`${(confidence * 100).toFixed(2)}%\`)`).join('\n')}
`
      const comment = context.issue({ body: commentBody })
      const _labels = context.issue({ labels: [...currentLabels.filter(Boolean), ...labels.map(({ label }) => label)] })

      await context.octokit.issues.createComment(comment)
      await context.octokit.issues.addLabels(_labels)
      // await context.octokit.issues.addAssignees(assignees)
      app.log('New response for issue')
    } catch (err) {
      app.log.error(err)
    }
  })
}
