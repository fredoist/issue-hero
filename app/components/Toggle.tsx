import { Switch } from '@headlessui/react'
import { useState } from 'react'

export const Toggle: React.FC<{state:boolean}> = ({ state }) => {
  const [enabled, setEnabled] = useState(state)

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
