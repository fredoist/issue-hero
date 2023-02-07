import { RadioGroup } from '@headlessui/react'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'
import { Config } from '../services/db';

const options = [
  { name: 'Short', value: 100 },
  { name: 'Medium', value: 300 },
  { name: 'Long', value: 500 },
]

export const Selector: React.FC<{ selected: number | undefined, config: Config }> = ({ selected, config }) => {
  const [value, setValue] = useState(options[0].value)
  const router = useRouter()
  const { repo } = router.query as { repo: string[] }

  useEffect(() => {
    fetch('/api/save-config', {
      method: 'POST',
      body: JSON.stringify({
        repo: repo.join('/'),
        config: { ...config, summary: { length: value } },
      }),
    })
  }, [value, repo])

  return (
    <RadioGroup className="w-64" value={value} onChange={setValue} defaultValue={selected}>
      <RadioGroup.Label className="block mb-2">Summary length</RadioGroup.Label>
      <div className="flex ring-1 ring-black/10 rounded overflow-hidden">
        {options.map((option) => (
          <RadioGroup.Option
            key={option.name}
            value={option.value}
            className={({ checked }) =>
              `${
                checked ? 'bg-violet-600 text-white' : ''
              } py-2 px-4 flex-1 cursor-pointer text-center`
            }
          >
            {option.name}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
