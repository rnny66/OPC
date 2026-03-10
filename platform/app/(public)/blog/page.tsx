import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import ContentCard from '@/components/content/ContentCard'
import ContentGrid from '@/components/content/ContentGrid'
import FeaturedHero from '@/components/content/FeaturedHero'

export const metadata: Metadata = {
  title: 'Blog — OPC Europe',
  description: 'Stories, strategy, and insights from the European Open Poker Championship.',
}

interface Props {
  searchParams: Promise<{ page?: string; tag?: string }>
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

export default async function BlogPage({ searchParams }: Props) {
  const { page, tag } = await searchParams
  const currentPage = parseInt(page || '1', 10)

  const payload = await getPayload({ config })

  const where: Record<string, any> = {
    _status: { equals: 'published' },
    category: { equals: 'blog' },
  }

  if (tag) {
    where['tags.tag'] = { equals: tag }
  }

  const posts = await payload.find({
    collection: 'posts',
    where,
    sort: '-publishedAt',
    page: currentPage,
    limit: 12,
  })

  const featuredPost = posts.docs.find((p) => p.isFeatured)
  const regularPosts = posts.docs.filter((p) => p !== featuredPost)

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
          Blog
        </h1>
        <p
          style={{
            fontSize: '1.0625rem',
            color: 'var(--color-text-secondary, #94969c)',
          }}
        >
          Stories, strategy, and insights from the OPC community.
        </p>
      </div>

      {featuredPost && (
        <FeaturedHero
          title={featuredPost.title}
          excerpt={featuredPost.excerpt}
          href={`/blog/${featuredPost.slug}`}
          coverImageUrl={getImageUrl(featuredPost.coverImage)}
          coverImageAlt={getImageAlt(featuredPost.coverImage)}
          badge="Featured"
          date={featuredPost.publishedAt}
          author={featuredPost.author}
        />
      )}

      {regularPosts.length > 0 ? (
        <ContentGrid
          currentPage={currentPage}
          totalPages={posts.totalPages}
          basePath="/blog"
          searchParams={tag ? { tag } : undefined}
        >
          {regularPosts.map((post) => (
            <ContentCard
              key={post.id}
              title={post.title}
              excerpt={post.excerpt}
              slug={post.slug}
              href={`/blog/${post.slug}`}
              coverImageUrl={getImageUrl(post.coverImage)}
              coverImageAlt={getImageAlt(post.coverImage)}
              badge="Blog"
              date={post.publishedAt}
              author={post.author}
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
          No blog posts published yet.
        </p>
      )}
    </div>
  )
}
