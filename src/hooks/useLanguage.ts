import { useState, useEffect } from 'react'
import { translations, LanguageCode } from '@/lib/i18n'

export function useLanguage() {
    const [language, setLanguage] = useState<LanguageCode>('en')
    const [t, setT] = useState(translations['en'])

    useEffect(() => {
        // Safe check for window/navigator existence (Next.js SSR)
        if (typeof window !== 'undefined' && navigator.language) {
            const browserLang = navigator.language.split('-')[0].toLowerCase() as LanguageCode

            if (translations[browserLang]) {
                setLanguage(browserLang)
                setT(translations[browserLang])
            } else {
                setLanguage('en')
                setT(translations['en'])
            }
        }
    }, [])

    return { language, t }
}
