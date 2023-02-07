import { RadioGroup } from '@headlessui/react'
import { useState } from 'react'

const options = [
  { name: 'Short', value: 100 },
  { name: 'Medium', value: 300 },
  { name: 'Long', value: 500 },
]

export const Selector: React.FC<{ selected: number | undefined }> = ({ selected }) => {
  const [value, setValue] = useState(options[0].value)

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
