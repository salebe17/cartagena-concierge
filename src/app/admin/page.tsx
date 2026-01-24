
export const dynamic = 'force-dynamic';

export default function AdminPage() {
    return (
        <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '30px', color: 'red' }}>🛑 ADMIN PAGE DEBUG MODE</h1>
            <p>If you can see this, the SERVER is working.</p>
            <p>The error 500 was caused by DB/Code components.</p>
        </div>
    );
}
