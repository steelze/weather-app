//Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js').then(reg => {
        // Registration was successful
    }).catch(err => console.log('ServiceWorker registration failed: ', err));
}