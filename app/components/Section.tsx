interface SectionProps {
  title: string
  description: string
  children: React.ReactNode
}

export const Section: React.FC<SectionProps> = ({ title, description, children }) => {
  return (
    <section className="py-12">
      <h3 className="text-xl font-medium">{title}</h3>
      <small className="block">{description}</small>
      {children}
    </section>
  )
}
