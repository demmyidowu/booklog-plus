import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const analytics = Analytics({
    app: 'booklog-plus',
    plugins: [
        googleAnalytics({
            measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID
        })
    ]
})

export const trackPageView = (currentPage) => {
    analytics.page({
        url: `/${currentPage}`,
        title: currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
    })
}

export const trackEvent = (category, action, label = null) => {
    analytics.track(action, {
        category,
        label
    })
}

export default analytics
