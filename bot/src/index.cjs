const { Probot } = require('probot') // eslint-disable-line no-unused-vars
const { summarize, label } = require('./utils.cjs')

/**
 * App entry point
 * @param {Probot} app The Probot context
 */
module.exports = (app) => {
  app.log('Yay, the app was loaded!')
  app.on('issues.opened', async (context) => {
    const { title, body, labels: currentLabels, assignees: currentAssignees } = context.payload.issue // eslint-disable-line no-unused-vars

    try {
      const summary = await summarize(`${title.trim()}. ${body.trim()}`)
      const labels = await label(body)

      const commentBody = `TLDR: ${summary}

---

We suggest the following labels based on the issue content:
${labels.map(({ label, confidence }) => `- ${label} (\`${(confidence * 100).toFixed(2)}%\`)`).join('\n')}
`
      const comment = context.issue({ body: commentBody })
      const _labels = context.issue({ labels: labels.map(({ label }) => label) })

      await context.octokit.issues.createComment(comment)
      await context.octokit.issues.addLabels(_labels)
      // await context.octokit.issues.addAssignees(assignees)
      app.log('New response for issue')
    } catch (err) {
      app.log.error(err)
    }
  })
}
