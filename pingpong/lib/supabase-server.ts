import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export const createServerSupabaseClient = async () => {
  // Get the cookies from the request
  const cookieStore = cookies();
  
  // Create and return the Supabase client
  return createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });
}

