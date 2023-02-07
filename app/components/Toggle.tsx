import { Switch } from '@headlessui/react'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'
import { Config } from '../services/db';

export const Toggle: React.FC<{state:boolean, config: Config, setting: string}> = ({ state, config, setting }) => {
  const [enabled, setEnabled] = useState(state)
  const router = useRouter()
  const { repo } = router.query as { repo: string[] }

  useEffect(() => {
    fetch('/api/save-config', {
      method: 'POST',
      body: JSON.stringify({
        repo: repo.join('/'),
        config: { ...config, [setting]: { enabled: enabled } },
      }),
    })
  }, [enabled, repo, setting])

  return (
    <label className="py-4 inline-flex items-center gap-2">
      <Switch
        checked={enabled}
        defaultChecked={state}
        onChange={setEnabled}
        className={`${enabled ? 'bg-violet-600' : 'bg-slate-400'}
          relative inline-flex h-[24px] w-[48px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${enabled ? 'translate-x-6' : 'translate-x-0'}
            pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </Switch>
      <span>{enabled ? 'Enabled' : 'Disabled'}</span>
    </label>
  )
}
