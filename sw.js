var cacheName = "restaurantsReview01";
var cacheFiles = [
    "/",
    "/manifest.json",
    "/restaurant.html",
    "/css/styles.css",
    "/idb.js",
    "/js/main.js",
    "/js/dbhelper.js",
    "/js/restaurant_info.js",
    "/img/1x1.jpg", 
    "/img/2x1.jpg", 
    "/img/3x1.jpg", 
    "/img/4x1.jpg", 
    "/img/5x1.jpg", 
    "/img/6x1.jpg", 
    "/img/7x1.jpg", 
    "/img/8x1.jpg",
    "/img/9x1.jpg",
    "/img/10x1.jpg",
];
if (typeof idb === "undefined") {
  self.importScripts('/idb.js');
}
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
    var requestUrl = new URL(event.request.url);
    if(event.request.url.includes('restaurants') || event.request.url.includes('reviews')) return;
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
          ).catch(function(error){console.log(error)});
        })
      );
  });