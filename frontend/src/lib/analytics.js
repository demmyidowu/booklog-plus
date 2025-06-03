import Analytics from 'analytics'
// import googleAnalytics from '@analytics/google-analytics'

// const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

// Initialize analytics with or without Google Analytics based on measurement ID
const analytics = Analytics({
    app: 'booklog-plus',
    plugins: measurementId ? [
        googleAnalytics({
            measurementId
        })
    ] : []
})

// Create debug versions of tracking functions that work even without GA
const debugTrack = (type, data) => {
    if (!measurementId) {
        console.debug(`[Analytics ${type}]:`, data)
        return
    }
    return true
}

export const trackPageView = (currentPage) => {
    if (debugTrack('PageView', { currentPage })) {
        analytics.page({
            url: `/${currentPage}`,
            title: currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
        })
    }
}

export const trackEvent = (category, action, label = null) => {
    if (debugTrack('Event', { category, action, label })) {
        analytics.track(action, {
            category,
            label
        })
    }
}

export const trackError = (error, context, component = 'Unknown') => {
    if (debugTrack('Error', { error, context, component })) {
        analytics.track('Error', {
            errorType: error.name || 'Unknown Error',
            message: error.message,
            component,
            context,
            stack: error.stack,
            timestamp: new Date().toISOString()
        })
    }
}

// Log warning if measurement ID is missing
if (!measurementId) {
    console.warn(
        'Google Analytics Measurement ID is not set. Analytics will run in debug mode.\n' +
        'To enable analytics, add VITE_GA_MEASUREMENT_ID to your .env file.'
    )
}

export default analytics
