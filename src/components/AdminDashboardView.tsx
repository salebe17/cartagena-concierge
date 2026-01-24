"use client";

import { useState } from "react";

// ZERO DEPENDENCY MODE
// No external UI components, no custom types, no icons.

export function AdminDashboardView({ requests: initialRequests, bookings = [] }: any) {
    // Minimal State
    const [requests] = useState(initialRequests || []);

    return (
        <div className="p-8 font-sans">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'blue' }}>ADMIN DASHBOARD: ZERO DEPENDENCY</h1>
            <p>If you see this, the component ITSELF is fine.</p>
            <div className="mt-4 p-4 border rounded bg-white">
                <p>Requests Count: {requests.length}</p>
                <p>Bookings Count: {bookings.length}</p>
            </div>
            {/* Native HTML Button */}
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                Test Native Button
            </button>
        </div>
    );
}
