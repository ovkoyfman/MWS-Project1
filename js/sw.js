var cacheName = "restaurantsReview02";
var cacheFiles = [
    '/',
    '/index.html',
    '/restaurant.html',
    '/css/styles.css',
    '/data/restaurants.json',
    '/js/main.js',
    '/js/dbhelper.js',
    '/js/restaurant_info.js'
];
self.addEventListener('install', function(event){
    event.waitUntil(
        caches.open(cacheName).then(
            function(cache){
                console.log("Installed", cache);
                return cache.addAll(cacheFiles).catch(function(e){
                    console.log(e);})
            }
        ).catch(function(e){
            console.log(e);
        })
    )
});
self.addEventListener('fetch', function(event){
    console.log('response', event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response){
            if(response){
                return fetch(event.request);
            }
            else{

            }
        })
    )
});