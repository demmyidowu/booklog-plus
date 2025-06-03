// Get the measurement ID from environment variables
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
const apiSecret = import.meta.env.VITE_GA_API_SECRET

// Function to get client ID from gtag
const getClientId = async () => {
    return new Promise((resolve) => {
        // Check if gtag is available
        if (typeof gtag === 'undefined') {
            console.error('gtag is not defined. Make sure the Google Analytics script is loaded.')
            return null
        }

        gtag('get', measurementId, 'client_id', (clientId) => {
            resolve(clientId)
        })
    })
}

// Function to send events to GA4
const sendToGA = async (eventName, eventParams = {}) => {
    if (!measurementId || !apiSecret) {
        console.error('Measurement ID or API Secret is missing')
        return
    }

    const clientId = await getClientId()
    if (!clientId) {
        console.error('Failed to get client ID')
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

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        console.debug(`Event ${eventName} sent successfully`)
    } catch (error) {
        console.error('Error sending event to GA4:', error)
    }
}

// Export tracking functions
export const trackPageView = async (currentPage) => {
    await sendToGA('page_view', {
        page_title: currentPage.charAt(0).toUpperCase() + currentPage.slice(1),
        page_location: `/${currentPage}`
    })
}

export const trackEvent = async (category, action, label = null) => {
    await sendToGA(action, {
        event_category: category,
        event_label: label
    })
}

export const trackError = async (error, context, component = 'Unknown') => {
    await sendToGA('error', {
        error_type: error.name || 'Unknown Error',
        error_message: error.message,
        error_component: component,
        error_context: context,
        error_stack: error.stack
    })
}

// Log warning if measurement ID is missing
if (!measurementId) {
    console.warn(
        'Google Analytics Measurement ID is not set.\n' +
        'To enable analytics, add VITE_GA_MEASUREMENT_ID to your .env file.'
    )
}

export default {
    trackPageView,
    trackEvent,
    trackError
}