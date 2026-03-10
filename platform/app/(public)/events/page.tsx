import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import ContentCard from '@/components/content/ContentCard'
import ContentGrid from '@/components/content/ContentGrid'

export const metadata: Metadata = {
  title: 'Events — OPC Europe',
  description: 'Tournament announcements and event updates from OPC Europe.',
}

interface Props {
  searchParams: Promise<{ page?: string; type?: string }>
}

function getImageUrl(coverImage: unknown): string | null {
  if (typeof coverImage === 'object' && coverImage && 'url' in coverImage) {
    return (coverImage as { url: string }).url
  }
  return null
}

function getImageAlt(coverImage: unknown): string {
  if (typeof coverImage === 'object' && coverImage && 'alt' in coverImage) {
    return (coverImage as { alt: string }).alt || ''
  }
  return ''
}

const typeLabels: Record<string, string> = {
  new_tournament: 'New Tournament',
  results: 'Results',
  update: 'Update',
}

export default async function EventsPage({ searchParams }: Props) {
  const { page, type } = await searchParams
  const currentPage = parseInt(page || '1', 10)

  const payload = await getPayload({ config })

  const where: Record<string, any> = {
    _status: { equals: 'published' },
  }

  if (type) {
    where.announcementType = { equals: type }
  }

  const events = await payload.find({
    collection: 'event-announcements',
    where,
    sort: '-publishedAt',
    page: currentPage,
    limit: 12,
  })

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--color-text-primary, #f5f5f6)',
            marginBottom: '0.5rem',
          }}
        >
          Events
        </h1>
        <p
          style={{
            fontSize: '1.0625rem',
            color: 'var(--color-text-secondary, #94969c)',
          }}
        >
          Tournament announcements and event updates.
        </p>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {[
          { value: '', label: 'All' },
          { value: 'new_tournament', label: 'New Tournaments' },
          { value: 'results', label: 'Results' },
          { value: 'update', label: 'Updates' },
        ].map((tab) => (
          <a
            key={tab.value}
            href={tab.value ? `/events?type=${tab.value}` : '/events'}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              backgroundColor:
                (type || '') === tab.value
                  ? 'var(--color-brand, #1570ef)'
                  : 'var(--color-bg-secondary, #161b22)',
              color:
                (type || '') === tab.value
                  ? '#fff'
                  : 'var(--color-text-secondary, #94969c)',
              border: '1px solid var(--color-border, #1f242f)',
            }}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {events.docs.length > 0 ? (
        <ContentGrid
          currentPage={currentPage}
          totalPages={events.totalPages}
          basePath="/events"
          searchParams={type ? { type } : undefined}
        >
          {events.docs.map((event) => (
            <ContentCard
              key={event.id}
              title={event.title}
              excerpt={
                event.excerpt ||
                (event.tournamentName
                  ? `${event.tournamentName} — ${event.tournamentVenue || ''}`
                  : null)
              }
              slug={event.slug}
              href={`/events/${event.slug}`}
              coverImageUrl={getImageUrl(event.coverImage)}
              coverImageAlt={getImageAlt(event.coverImage)}
              badge={typeLabels[event.announcementType] || event.announcementType}
              date={event.publishedAt}
            />
          ))}
        </ContentGrid>
      ) : (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--color-text-secondary, #94969c)',
            padding: '3rem 0',
          }}
        >
          No event announcements published yet.
        </p>
      )}
    </div>
  )
}
