'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Algo salió mal</h2>
                    <p className="text-gray-500">
                        La aplicación ha encontrado un error crítico. No te preocupes, hemos sido notificados.
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                        <pre className="text-xs bg-gray-200 p-2 rounded text-left overflow-auto max-h-40">
                            {error.message}
                        </pre>
                    )}
                    <button
                        onClick={() => reset()}
                        className="w-full rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </body>
        </html>
    )
}
