import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../msw/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'

describe('MSW setup', () => {
  it('intercepts Supabase REST calls', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/tournaments`, () => {
        return HttpResponse.json([
          { id: '1', name: 'Amsterdam Open' },
        ])
      })
    )

    const response = await fetch(`${SUPABASE_URL}/rest/v1/tournaments`)
    const data = await response.json()

    expect(data).toHaveLength(1)
    expect(data[0].name).toBe('Amsterdam Open')
  })
})
