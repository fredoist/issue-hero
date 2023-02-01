/**
 * A function that returns a formatted comment string according to given params.
 *
 * @param {string} summary - The AI generated summary of the issue
 * @param {{label: string, confidence: number}[]} labels - The array of AI classified labels
 * @param {boolean} flagged - Wheter if the issue is marked as spam or toxic
 * @return {string} - The comment formatted string
 */
exports.createComment = (summary, labels, flagged) => {
  const formattedLabels = labels
    .map(({ label, confidence }) => {
      const percentage = (confidence * 100).toFixed(2)
      return `${label} (\`${percentage}%\`)`
    })
    .join(', ')

  const summaryCtx = `TLDR: ${summary}`
  const labelsCtx = `The following labels have been added based on issue context:\n\n${formattedLabels}`
  const spamCtx = 'This issue has been marked as spam and will be closed.'
  const feedbackCtx = `Please rate this response by reacting with :+1: or :-1: to this comment. You can also provide feedback in [our repository](https://github.com/fredoist/issue-hero/issues/new)`

  if (flagged) {
    return `${spamCtx}\n\nWe'll notify maintainers to review this issue: @fredoist\n\n---\n\n${feedbackCtx}`
  }

  return `${summaryCtx}\n\n${labelsCtx}\n\n---\n\n${feedbackCtx}`
}
