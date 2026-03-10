import PublicHeader from '@/components/content/PublicHeader'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '2rem 1.5rem',
        }}
      >
        {children}
      </main>
    </>
  )
}
