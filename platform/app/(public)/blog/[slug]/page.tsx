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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug }, category: { equals: 'blog' }, _status: { equals: 'published' } },
    limit: 1,
  })
  const post = docs[0]
  if (!post) return { title: 'Not Found — OPC Europe' }

  const imageUrl = getImageUrl(post.coverImage)
  return {
    title: `${post.title} — OPC Europe`,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug }, category: { equals: 'blog' }, _status: { equals: 'published' } },
    limit: 1,
  })
  const post = docs[0]
  if (!post) notFound()

  const imageUrl = getImageUrl(post.coverImage)

  return (
    <article style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Link
        href="/blog"
        style={{
          fontSize: '0.875rem',
          color: 'var(--color-brand, #1570ef)',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          display: 'inline-block',
        }}
      >
        ← Back to Blog
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
          Blog
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
          {post.title}
        </h1>
        <div
          style={{
            fontSize: '0.9375rem',
            color: 'var(--color-text-tertiary, #6b7280)',
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          <time>
            {new Date(post.publishedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
          {post.author && (
            <>
              <span>·</span>
              <span>{post.author}</span>
            </>
          )}
        </div>
      </header>

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
            alt={getImageAlt(post.coverImage)}
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
        {post.content && <RichText data={post.content} />}
      </div>
    </article>
  )
}
