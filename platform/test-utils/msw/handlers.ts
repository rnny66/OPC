import { http, HttpResponse } from 'msw'

// Base Supabase URL — matches the env var NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'

export const handlers = [
  // Default handler for Supabase auth session check
  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json(null, { status: 401 })
  }),
]
