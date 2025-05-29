import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Database } from '@/lib/schema'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

export default function Notification({ userId }: { userId: string }) {
  const supabase = useSupabaseClient<Database>()
  const [notifications, setNotifications] = useState<NotificationRow[]>([])

  // Fetch existing notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
      if (!error && data) setNotifications(data)
    }
    fetchNotifications()
  }, [supabase, userId])

  // Subscribe to new notifications in real-time
  useEffect(() => {
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationRow, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  return (
    <div className="fixed top-4 right-4 z-50">
      {notifications.slice(0, 5).map((n) => (
        <div key={n.id} className="bg-blue-100 p-2 rounded mb-2 shadow text-sm">
          {n.message}
        </div>
      ))}
    </div>
  )
}