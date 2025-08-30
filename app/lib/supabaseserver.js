
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
//function to create supabase client on server side
export async function createServerSide() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,//url to connect with supabase
    process.env.NEXT_PUBLIC_ANON_SUPABASE_KEY,//anon key to connect with supabase
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()//returns all cookies in the form of an array
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // ignored on server components
          }
        },
      },
    }
  )
}
