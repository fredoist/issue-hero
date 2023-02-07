import Image from 'next/image'

export const Header = () => {
  return (
    <div className="p-5 max-w-7xl mx-auto flex items-center justify-between">
      <div className="inline-flex items-center gap-2">
        <Image
          src="/AppIcon.svg"
          width={24}
          height={24}
          alt="App Icon"
          className="w-6 h-6 rounded"
        />
        <strong>Issue Hero</strong>
      </div>
      <a href="/api/logout" className="text-sm">
        Log Out
      </a>
    </div>
  )
}
