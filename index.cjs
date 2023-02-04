const { summarize, label, isSpam } = require('./bot/ai.cjs')
const { createComment, getConfig, saveConfig, redis } = require('./bot/utils.cjs')

/**
 * App entry point
 * @param {import('probot').Probot} app - The Probot context
 * @param {import('probot').ApplicationFunctionOptions} options - The Probot server options
 *
 * @todo Add support for assignees
 * @todo Add support for duplicated issues
 */
module.exports = async (app, { getRouter }) => {
  await redis.connect()

  app.on('issues.opened', async (context) => {
    const {
      title,
      body,
      labels: currentLabels,
      assignees: currentAssignees,
    } = context.payload.issue // eslint-disable-line no-unused-vars

    try {
      const config = await getConfig(context.payload.repository.full_name)
      const isToxic = await isSpam(`${title.trim()}. ${body.trim()}`)
      const summary = await summarize(`${title.trim()}. ${body.trim()}`)
      const labels = await label(body)

      const comment = context.issue({ body: createComment(summary, labels, isToxic, config) })
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

  const router = getRouter('/api')

  router.use(require('express').json())
  router.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'http://0.0.0.0:3000']
    if (!allowedOrigins.includes(req.headers.origin)) {
      res.status(401).send('Unauthorized')
      return
    }

    next()
  })

  router.get('/config/*', async (req, res) => {
    try {
      const repo = req.params[0]
      const config = (await getConfig(repo)) || {}
      res.status(200).json(config)
    } catch (err) {
      app.log.error(err)
      res.status(500).send('Internal Server Error')
    }
  })
  router.patch('/config/*', async (req, res) => {
    try {
      const repo = req.params[0]
      const config = await saveConfig(repo, req.body)
      res.status(200).json(config)
    } catch (err) {
      app.log.error(err)
      res.status(500).send('Internal Server Error')
    }
  })
}
