// Google Analytics (GA4) bootstrap, kept in a file so the Content-Security-Policy
// does not need 'unsafe-inline' for scripts. Loaded right after gtag.js in index.html.
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-C4JV6510PN', { 'anonymize_ip': true });
