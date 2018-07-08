var cacheName = "restaurantsReview01";
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

self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response;
          }
          var fetchRequest = event.request.clone(); 
          return fetch(fetchRequest).then(
            function(response) {
              if(!response) {
                return response;
              }
              var responseForCaching = response.clone();
              caches.open(cacheName)
                .then(function(cache) {
                  cache.put(event.request, responseForCaching);
                });
              return response;
            }
          );
        })
      );
  });