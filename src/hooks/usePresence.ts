import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePresence(roomId: string, userId: string, payload: any = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        if (!userId) return;

        const channel = supabase.channel(`presence:${roomId}`);

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const users = Object.values(state).flatMap((s: any) => s);
                setOnlineUsers(users);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log('User joined:', key, newPresences);
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                console.log('User left:', key, leftPresences);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track this user's presence in the channel
                    await channel.track({
                        user_id: userId,
                        online_at: new Date().toISOString(),
                        ...payload,
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, userId, supabase]);

    return { onlineUsers };
}
