"use client";

import { useState } from "react";
import { ServiceRequest } from "@/lib/types";
import { Button } from "./ui/button";

interface AdminDashboardViewProps {
    requests: ServiceRequest[];
    bookings?: any[];
}

export function AdminDashboardView({ requests: initialRequests, bookings = [] }: AdminDashboardViewProps) {
    // Minimal State
    const [requests] = useState(initialRequests);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard Component</h1>
            <p>If you see this, the component renders safely.</p>
            <div className="mt-4 p-4 border rounded bg-white">
                <p>Requests Count: {requests.length}</p>
                <p>Bookings Count: {bookings.length}</p>
            </div>
            <Button className="mt-4">Test Button</Button>
        </div>
    );
}
