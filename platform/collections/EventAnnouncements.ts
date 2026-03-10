import type { CollectionConfig } from 'payload'
import { createSupabaseAdmin } from '@/lib/supabase/admin'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const EventAnnouncements: CollectionConfig = {
  slug: 'event-announcements',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'announcementType', 'tournamentName', 'publishedAt', '_status'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from title with "event-" prefix.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return `event-${slugify(data.title)}`
            }
            return value
          },
        ],
      },
    },
    {
      name: 'tournamentId',
      type: 'text',
      required: true,
      label: 'Tournament ID',
      admin: {
        description: 'UUID of the linked tournament',
      },
    },
    {
      name: 'tournamentName',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'tournamentVenue',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'tournamentStartDate',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'announcementType',
      type: 'select',
      required: true,
      options: [
        { label: 'New Tournament', value: 'new_tournament' },
        { label: 'Results', value: 'results' },
        { label: 'Update', value: 'update' },
      ],
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (data.tournamentId) {
          const supabase = createSupabaseAdmin()
          const { data: tournament } = await supabase
            .from('tournaments')
            .select('name, venue, start_date')
            .eq('id', data.tournamentId)
            .single()

          if (tournament) {
            data.tournamentName = tournament.name
            data.tournamentVenue = tournament.venue
            data.tournamentStartDate = tournament.start_date
          }
        }
        return data
      },
    ],
  },
  access: {
    read: ({ req }) => {
      if (!req.user) {
        return { _status: { equals: 'published' } }
      }
      return true
    },
  },
}
