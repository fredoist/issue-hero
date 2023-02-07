import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

const Home: NextPage = () => {
  return (
    <main role="main">
      <Head>
        <title>Issue Hero: Better issue management with AI</title>
        <meta
          name="description"
          content="Efficiently handle issues with AI-powered automation for summaries, labels, spam filtering, and duplicate detection."
        />
        <link rel="shortcut icon" href="/AppIcon.svg" type="image/svg+xml" />
      </Head>
      <div className="mx-auto max-w-7xl flex">
        <section className="w-1/2 py-32 px-5">
          <header className="flex gap-2 items-center mb-5">
            <Image
              src="/AppIcon.svg"
              width={24}
              height={24}
              className="w-6 h-6 rounded"
              alt="Issue Hero Icon"
            />
            <strong className="text-sm font-medium">Issue Hero</strong>
          </header>
          <h1 className="text-4xl font-bold mb-5">Better Issue Management with AI</h1>
          <p className="text-lg mb-10 text-slate-700">
            Efficiently handle issues with AI-powered automation for summaries, labels, spam
            filtering, and duplicate detection.
          </p>
          <div className="flex gap-2 items-center">
            <a
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-t from-violet-900 via-violet-800 to-violet-700 text-white font-medium hover:shadow-xl hover:shadow-violet-600/30 transition-shadow duration-200 ease-in ring-1 ring-violet-600 border border-white"
              href="https://github.com/apps/issue-hero/installations/new"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                className="w-6 h-6 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Install App
            </a>
            <a className="py-3 px-6 group inline-flex gap-2" href="/api/login">
              Sign In
              <span className="group-hover:translate-x-1 transition-transform duration-200 ease-linear">
                →
              </span>
            </a>
          </div>
          <div className="flex gap-x-1 mt-16">
            <span className="text-xs leading-loose">Powered by</span>
            <img
              className="w-14 h-4 align-bottom"
              src="https://cdn.sanity.io/images/rjtqmwfu/production/572048a4c0309a03493e1bcf7bbd3c4d64d088e5-1552x446.svg"
              alt="cohere.ai"
            />
          </div>
        </section>
        <div className="w-1/2 h-full overflow-hidden mt-12 px-5">
          <svg
            id="visual"
            viewBox="0 0 900 675"
            width="900"
            height="675"
            className="absolute bottom-0 right-0 -z-10"
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
          >
            <g fill="#715DF2">
              <circle r="169" cx="803" cy="511"></circle>
              <circle r="53" cx="491" cy="182"></circle>
              <circle r="66" cx="862" cy="74"></circle>
            </g>
          </svg>
        </div>
      </div>
    </main>
  )
}

export default Home
