import type { GetServerSideProps, NextPage } from 'next'
import { Header } from '../components/Header'
import { ListBox } from '../components/Listbox'
import { RepoPicker } from '../components/RepoPicker'
import { Section } from '../components/Section'
import { Selector } from '../components/Selector'
import { Toggle } from '../components/Toggle'
import redis, { Config, getConfig, getRepos } from '../services/db'

interface RepoProps {
  repo: string
  repos: string[]
  config: Config
  collaborators: any[]
}

const Repo: NextPage<RepoProps> = ({ repo, repos, config, collaborators }: RepoProps) => {
  return (
    <main role="main">
      <Header />
      <div className="max-w-7xl mx-auto px-5 py-12">
        <RepoPicker selected={repo} repos={repos} />
        <div className="divide-y divide-slate-100">
          <Section title="Summary" description="Create summary comments for new issues">
            <Toggle setting="summary" state={config.summary.enabled} config={config} />
            <Selector selected={config.summary.lenght} config={config} />
          </Section>
          <Section title="Labelling" description="Automatically label issues">
            <Toggle setting="label" state={config.label.enabled} config={config} />
          </Section>
          <Section title="Spam filtering" description="Filter out spammy issues">
            <Toggle setting="spam" state={config.spam.enabled} config={config} />
            <ListBox options={collaborators} config={config} />
          </Section>
        </div>
      </div>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const { repo } = params as { repo: string[] }
  const { token } = req.cookies

  if (!token) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  }

  try {
    const { login: user } = await fetch('https://api.github.com/user', options).then((r) =>
      r.json()
    )

    await redis.connect()
    const repos = await getRepos(user)
    const config = await getConfig(repo.join('/'))

    const collaborators = await fetch(
      `https://api.github.com/repos/${repo.join('/')}/collaborators`,
      options
    ).then((r) => r.json())

    return {
      props: {
        repo: repo.join('/'),
        repos,
        config,
        collaborators,
      },
    }
  } catch (error) {
    return {
      props: {
        repo: repo.join('/'),
        repos: [],
        config: {},
        collaborators: [],
      },
    }
  }
}

export default Repo
