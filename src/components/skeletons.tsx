
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-white p-4 md:p-8 animate-pulse">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-gray-200" />
                        <Skeleton className="h-10 w-64 bg-gray-200" />
                    </div>
                    <Skeleton className="h-12 w-48 rounded-full bg-gray-200" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-2xl bg-gray-100" />
                    ))}
                </div>
            </div>
        </div>
    )
}
