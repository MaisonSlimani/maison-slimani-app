'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

// Header GTM script (goes in <head>)
export function GoogleTagManagerHead() {
    const [headerCode, setHeaderCode] = useState<string | null>(null)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings')
                if (response.ok) {
                    const result = await response.json()
                    if (result.success && result.data) {
                        setHeaderCode(result.data.google_tag_manager_header)
                    }
                }
            } catch (error) {
                console.error('Error fetching GTM settings:', error)
            }
        }

        fetchSettings()
    }, [])

    if (!headerCode) return null

    return (
        <Script
            id="gtm-header"
            strategy="afterInteractive"
            onError={(e) => {
                // Suppress ad blocker errors in development
                if (process.env.NODE_ENV === 'development') {
                    e.preventDefault?.()
                }
            }}
        >
            {`
            // Helper to strip <script> tags if user pasted them
            (function() {
              var code = ${JSON.stringify(headerCode)};
              // Remove wrapping <script> tags if present to prevent nesting issues
              code = code.replace(/<script[^>]*>|<\\/script>/gi, '');
              // Clean comments to avoid issues
              code = code.replace(/<!--[\\s\\S]*?-->/g, '');
              
              // Create script element
              var script = document.createElement('script');
              script.innerHTML = code;
              document.head.appendChild(script);
            })();
          `}
        </Script>
    )
}

// Body GTM noscript (goes in <body>)
export function GoogleTagManagerBody() {
    const [bodyCode, setBodyCode] = useState<string | null>(null)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings')
                if (response.ok) {
                    const result = await response.json()
                    if (result.success && result.data) {
                        setBodyCode(result.data.google_tag_manager_body)
                    }
                }
            } catch (error) {
                console.error('Error fetching GTM settings:', error)
            }
        }

        fetchSettings()
    }, [])

    if (!bodyCode) return null

    return (
        <div
            id="gtm-body-noscript"
            dangerouslySetInnerHTML={{ __html: bodyCode }}
            className="hidden"
            style={{ display: 'none', visibility: 'hidden' }}
        />
    )
}

// Default export for backward compatibility (header only)
export default GoogleTagManagerHead
