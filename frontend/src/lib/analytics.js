// Get the measurement ID from environment variables
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
const apiSecret = import.meta.env.VITE_GA_API_SECRET

// Function to get client ID from gtag
const getClientId = async () => {
    return new Promise((resolve) => {
        // Check if gtag is available
        if (typeof gtag === 'undefined') {
            console.debug('gtag is not available (likely blocked by ad blocker)')
            resolve(null) // ✅ FIX: resolve the promise instead of returning
            return
        }

        try {
            gtag('get', measurementId, 'client_id', (clientId) => {
                resolve(clientId)
            })
        } catch (error) {
            console.debug('Error getting client ID:', error)
            resolve(null)
        }
    })
}

// Function to send events to GA4
const sendToGA = async (eventName, eventParams = {}) => {
    try {
        if (!measurementId || !apiSecret) {
            console.debug('Analytics: Measurement ID or API Secret is missing')
            return
        }

        const clientId = await getClientId()
        if (!clientId) {
            console.debug('Analytics: Failed to get client ID, skipping event')
            return
        }

        const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`

        const body = {
            client_id: clientId,
            events: [{
                name: eventName,
                params: {
                    ...eventParams,
                    session_id: Date.now().toString(),
                    engagement_time_msec: 100
                }
            }]
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        console.debug(`Analytics: Event ${eventName} sent successfully`)
    } catch (error) {
        // Silently fail - don't break the app for analytics
        console.debug('Analytics: Error sending event:', error)
    }
}

// Export tracking functions - all wrapped in try/catch
export const trackPageView = async (currentPage) => {
    try {
        await sendToGA('page_view', {
            page_title: currentPage.charAt(0).toUpperCase() + currentPage.slice(1),
            page_location: `/${currentPage}`
        })
    } catch (error) {
        console.debug('Analytics: Page view tracking failed:', error)
    }
}

export const trackEvent = async (category, action, label = null) => {
    try {
        await sendToGA(action, {
            event_category: category,
            event_label: label
        })
    } catch (error) {
        console.debug('Analytics: Event tracking failed:', error)
    }
}

export const trackError = async (error, context, component = 'Unknown') => {
    try {
        await sendToGA('error', {
            error_type: error.name || 'Unknown Error',
            error_message: error.message,
            error_component: component,
            error_context: context,
            error_stack: error.stack
        })
    } catch (analyticsError) {
        console.debug('Analytics: Error tracking failed:', analyticsError)
    }
}

// Log warning if measurement ID is missing (but don't break)
if (!measurementId) {
    console.debug(
        'Analytics: Google Analytics Measurement ID is not set.\n' +
        'To enable analytics, add VITE_GA_MEASUREMENT_ID to your .env file.'
    )
}

export default {
    trackPageView,
    trackEvent,
    trackError
}