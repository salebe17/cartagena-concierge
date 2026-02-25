import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRealtimeBids(requestId: string, initialBids: any[] = []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [bids, setBids] = useState<any[]>(initialBids);
    const supabase = createClient();

    useEffect(() => {
        // Sync initial bids just in case they were empty or stale
        setBids(initialBids);

        const channel = supabase
            .channel(`realtime:bids:${requestId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'bids',
                    filter: `request_id=eq.${requestId}`,
                },
                (payload) => {
                    console.log('Realtime Bid Payload:', payload);

                    if (payload.eventType === 'INSERT') {
                        setBids((prev) => [...prev, payload.new]);
                    } else if (payload.eventType === 'UPDATE') {
                        setBids((prev) =>
                            prev.map((bid) => (bid.id === payload.new.id ? payload.new : bid))
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setBids((prev) => prev.filter((bid) => bid.id !== payload.old.id));
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to Realtime Bids for request ${requestId}`);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestId, supabase]);

    // Support for Optimistic UI Updates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addOptimisticBid = (optimisticBid: any) => {
        setBids((prev) => [...prev, optimisticBid]);
    };

    const removeOptimisticBid = (id: string) => {
        setBids((prev) => prev.filter((bid) => bid.id !== id));
    };

    return { bids, addOptimisticBid, removeOptimisticBid };
}
