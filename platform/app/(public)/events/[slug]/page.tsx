import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'event-announcements',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
  })
  const event = docs[0]
  if (!event) return { title: 'Not Found — OPC Europe' }

  const imageUrl = getImageUrl(event.coverImage)
  return {
    title: `${event.title} — OPC Europe`,
    description: event.excerpt || undefined,
    openGraph: {
      title: event.title,
      description: event.excerpt || undefined,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'event-announcements',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
  })
  const event = docs[0]
  if (!event) notFound()

  const imageUrl = getImageUrl(event.coverImage)

  return (
    <article style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Link
        href="/events"
        style={{
          fontSize: '0.875rem',
          color: 'var(--color-brand, #1570ef)',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          display: 'inline-block',
        }}
      >
        ← Back to Events
      </Link>

      <header style={{ marginBottom: '2rem' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-sm, 6px)',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            backgroundColor: 'var(--color-brand, #1570ef)',
            color: '#fff',
            marginBottom: '0.75rem',
          }}
        >
          {typeLabels[event.announcementType] || event.announcementType}
        </span>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: 'var(--color-text-primary, #f5f5f6)',
            lineHeight: 1.2,
            marginBottom: '0.75rem',
          }}
        >
          {event.title}
        </h1>
        <div
          style={{
            fontSize: '0.9375rem',
            color: 'var(--color-text-tertiary, #6b7280)',
          }}
        >
          <time>
            {new Date(event.publishedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
        </div>
      </header>

      {/* Tournament info card */}
      {event.tournamentName && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'var(--color-bg-secondary, #161b22)',
            border: '1px solid var(--color-border, #1f242f)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-text-tertiary, #6b7280)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
            }}
          >
            Tournament
          </div>
          <div
            style={{
              fontSize: '1.0625rem',
              fontWeight: 600,
              color: 'var(--color-text-primary, #f5f5f6)',
            }}
          >
            {event.tournamentName}
          </div>
          {event.tournamentVenue && (
            <div
              style={{
                fontSize: '0.9375rem',
                color: 'var(--color-text-secondary, #94969c)',
                marginTop: '0.25rem',
              }}
            >
              {event.tournamentVenue}
              {event.tournamentStartDate && (
                <span>
                  {' — '}
                  {new Date(event.tournamentStartDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {imageUrl && (
        <div
          style={{
            borderRadius: 'var(--radius-lg, 12px)',
            overflow: 'hidden',
            marginBottom: '2rem',
          }}
        >
          <img
            src={imageUrl}
            alt={getImageAlt(event.coverImage)}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      )}

      <div
        style={{
          color: 'var(--color-text-secondary, #d0d0d0)',
          fontSize: '1.0625rem',
          lineHeight: 1.75,
        }}
      >
        {event.content && <RichText data={event.content} />}
      </div>
    </article>
  )
}
