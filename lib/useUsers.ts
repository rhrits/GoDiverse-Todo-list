import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export function useUsers() {
  const supabase = useSupabaseClient()
  const [users, setUsers] = useState<{ id: string; email: string }[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles') // changed from 'users' to 'profiles'
        .select('id, email')
      if (!error && data) setUsers(data)
    }
    fetchUsers()
  }, [supabase])

  return users
}