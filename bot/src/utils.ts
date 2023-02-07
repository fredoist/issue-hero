import { Config } from './db'

interface CommentProps {
  summary: string | null
  labels: any[]
  config?: Config
}

export const createComment = ({ summary, labels }: CommentProps) => {
  const formattedLabels = formatLabels(labels)
  const summaryCtx = summary && `TLDR: ${summary}`
  const labelsCtx =
    labels && `The following labels have been added based on issue context:\n\n${formattedLabels}`
  const feedbackCtx = `Please rate this response by reacting with :+1: or :-1: to this comment. You can also provide feedback in [our repository](https://github.com/fredoist/issue-hero/issues/new)`

  return `${summaryCtx}\n\n${labelsCtx}\n\n---\n\n${feedbackCtx}`
}

const formatLabels = (labels: any[]) => {
  return labels
    .map(({ label, confidence }) => {
      const percentage = (confidence * 100).toFixed(2)
      return `${label} (\`${percentage}%\`)`
    })
    .join(', ')
}
