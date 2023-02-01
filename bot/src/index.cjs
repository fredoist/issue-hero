const { summarize, label, isSpam } = require('./ai.cjs');
const { createComment } = require('./utils.cjs');

/**
 * App entry point
 * @param {import('probot').Probot} app - The Probot context
 *
 * @todo Add support for assignees
 * @todo Add support for custom settings
 * @todo Add support for duplicated issues
 */
module.exports = (app) => {
  app.on('issues.opened', async (context) => {
    const { title, body, labels: currentLabels, assignees: currentAssignees } = context.payload.issue // eslint-disable-line no-unused-vars

    try {
      const isToxic = await isSpam(`${title.trim()}. ${body.trim()}`)
      const summary = await summarize(`${title.trim()}. ${body.trim()}`)
      const labels = await label(body)

      const comment = context.issue({ body: createComment(summary, labels, isToxic) })
      await context.octokit.issues.createComment(comment)

      if (isToxic) {
        await context.octokit.issues.update(context.issue({ state: 'closed' }))
        return
      }

      await context.octokit.issues.addLabels(labels.map(({ label }) => label))
    } catch (err) {
      app.log.error(err)
    }
  })
}
