/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
  
  static fetchRestaurants(id,callback){
    
    const dbPromise = idb.open('restaurantsDatabase', 2, function(upgradeDb) {
     // switch (upgradeDb.oldVersion) {
       // case 0:
          upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
        //case 1:
          //upgradeDb.createObjectStore('reviews', {keyPath: 'id'});
      //}
    });
    var url;
    url = DBHelper.DATABASE_URL;
    fetch(url).then(function(response) { 
      console.log("fetching..."); 
      var restaurants = response.json();
      dbPromise.then(function(db){
        if(!db) return;
        //var store = db.transaction('restaurants','readwrite').objectStore('restaurants');
        console.log(restaurants);
        restaurants.then(function(data){
          data.forEach(function(restaurant){
            console.log(restaurant.id);
            fetch('http://localhost:1337/reviews/?restaurant_id=' + restaurant.id).then(function(data){ return data.json();}).then(function(data){
              var reviews = data;
              console.log("Data for reviews",reviews);
              restaurant.reviews = reviews;
            }).then(function(){
              db.transaction('restaurants','readwrite').objectStore('restaurants').put(restaurant);
              if (data.length == restaurant.id){
                var tx = db.transaction('restaurants','readonly').objectStore('restaurants').getAll();
                if(id) return tx.then(function(data){callback(data[id-1])});
                else  return tx.then(function(data){if(data.length){callback(data)}}); 
              }
            })
          });
        })
      }).catch(function(error){console.log(error)});
    }).catch(function(error){
      console.log(error);
      dbPromise.then(function(db){
        var dbTransection = db.transaction('restaurants','readonly').objectStore('restaurants').getAll();
        if(id) return dbTransection.then(function(data){callback(data[id-1])});
        else  return dbTransection.then(function(data){if(data.length){callback(data)}});
      })
    });
    
    
    //if(id) url = DBHelper.DATABASE_URL + '/?id=' + id;
    //else 
    
    // fetch(url).then(function(response) {
    //     return tempResponse;
    //   }).then(callback).catch(callbackError);
   }
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants(id,(restaurants) => {
        const restaurant = restaurants;
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    restaurants = self.restaurantsFetchedData;

    // Fetch all restaurants  with proper error handling
      
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static getRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
      restaurants = self.restaurantsFetchedData;
      let results = restaurants;
      if (cuisine != 'all') { // filter by cuisine
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = results.filter(r => r.neighborhood == neighborhood);
      }
      callback(results);
  }
  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {

    // Fetch all restaurants
    restaurants = self.restaurants;

        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(uniqueNeighborhoods);
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    restaurants = self.restaurants;

    // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(uniqueCuisines);
    }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image and x2 URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(!restaurant.photograph) restaurant.photograph = "10";
    return (`/img/${restaurant.photograph}.jpg`);
  }
  /**
   * Restaurant x1 image URL.
   */
  static imageUrlForRestaurantx1(restaurant) {
    if(!restaurant.photograph) restaurant.photograph = "10";
    return (`/img/${restaurant.photograph}x1.jpg`);
  }
  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {

    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  static displayError(error){
    console.error(error);
  }

}

