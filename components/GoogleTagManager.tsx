'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function GoogleTagManager() {
    const [headerCode, setHeaderCode] = useState<string | null>(null)
    const [bodyCode, setBodyCode] = useState<string | null>(null)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings')
                if (response.ok) {
                    const result = await response.json()
                    if (result.success && result.data) {
                        setHeaderCode(result.data.google_tag_manager_header)
                        setBodyCode(result.data.google_tag_manager_body)
                    }
                }
            } catch (error) {
                console.error('Error fetching GTM settings:', error)
            }
        }

        fetchSettings()
    }, [])

    if (!headerCode && !bodyCode) return null

    return (
        <>
            {/* Header Script - Injected into <head> */}
            {headerCode && (
                <Script
                    id="gtm-header"
                    strategy="afterInteractive"
                >
                    {`
            // Helper to strip <script> tags if user pasted them
            (function() {
              var code = ${JSON.stringify(headerCode)};
              // Remove wrapping <script> tags if present to prevent nesting issues
              code = code.replace(/<script[^>]*>|<\/script>/gi, '');
              // Clean comments to avoid issues
              code = code.replace(/<!--[\s\S]*?-->/g, '');
              
              // Create script element
              var script = document.createElement('script');
              script.innerHTML = code;
              document.head.appendChild(script);
            })();
          `}
                </Script>
            )}

            {/* Body Script - Injected into body via a portal or directly if position doesn't strictly matter for noscript */}
            {/* Since noscript is usually for non-JS overrides, finding "perfect" placement dynamically is hard.
          Standard approaches often just render it. Since this component is inside Layout, it's in Body.
          Using dangerouslySetInnerHTML is required to render raw HTML. */}
            {bodyCode && (
                <div
                    id="gtm-body-noscript"
                    dangerouslySetInnerHTML={{ __html: bodyCode }}
                    className="hidden" // Often GTM noscript is an iframe that is hidden anyway, but let's be safe
                    style={{ display: 'none', visibility: 'hidden' }}
                />
            )}
        </>
    )
}
