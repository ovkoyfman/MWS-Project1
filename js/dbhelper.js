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
  /**
   * Fetch all restaurants.
   */
  // static fetchRestaurants(callback) {
  //   console.log('1');
  //   let xhr = new XMLHttpRequest();
  //   xhr.open('GET', DBHelper.DATABASE_URL);
  //   xhr.onload = () => {
  //     if (xhr.status === 200) { // Got a success response from server!
  //       const json = JSON.parse(xhr.responseText);
  //       const restaurants = json;
  //       console.log(restaurants);
  //       callback(null, restaurants);
  //     } else { // Oops!. Got an error from server.
  //       const error = (`Request failed. Returned status of ${xhr.status}`);
  //       callback(error, null);
  //     }
  //   };
  //   xhr.send();
  // }
  static fetchRestaurants(id,callback){
    console.log("fetchRestaurants");
    var url;
    url = DBHelper.DATABASE_URL;
    var dbPromise = idb.open('restaurantsDatabase');
    
    dbPromise.then(function(db){
      var dbTransection = db.transaction('restaurants','readonly').objectStore('restaurants').getAll();
      if(id) dbTransection.then(function(data){callback(data[id-1])});
      else  dbTransection.then(function(data){callback(data)});
    })
    fetch(url).then(function(response) {
      console.log(response);
      var responseForDatabase = response.clone();
      var responseForPopulating = response.json();
      //console.log(responseForDatabase);
      var restaurants = responseForDatabase.json();
      dbPromise.then(function(db){
        if(!db) return;
        var store = db.transaction('restaurants','readwrite').objectStore('restaurants');
        restaurants.then(function(data){
          data.forEach(function(restaurant){
            store.put(restaurant);
          })
        }) 
      })
      if(id) responseForPopulating.then(function(data){callback(data[id-1])})
      else  responseForPopulating.then(function(data){callback(data)})
      
    })
    //if(id) url = DBHelper.DATABASE_URL + '/?id=' + id;
    //else 
    url = DBHelper.DATABASE_URL;
    console.log(dbPromise);
    
    // fetch(url).then(function(response) {
    //     return tempResponse;
    //   }).then(callback).catch(callbackError);
   }
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    console.log("fetchRestaurantById");
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
    restaurants = self.restaurants;
    console.log(restaurants);

    // Fetch all restaurants  with proper error handling
      console.log('fetchRestaurantByCuisine');
      
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
 // static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
  //  DBHelper.fetchRestaurants((restaurants) => {
      // Filter restaurants to have only given neighborhood
  //    const results = restaurants.filter(r => r.neighborhood == neighborhood);
   //   callback(null, results);
   // });
  //}

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    console.log("fetchRestaurantByCuisineAndNeighborhood");
    DBHelper.fetchRestaurants(null,(restaurants) => {
      console.log(restaurants);
      let results = restaurants;
      if (cuisine != 'all') { // filter by cuisine
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = results.filter(r => r.neighborhood == neighborhood);
      }
      callback(results);
    });
  }
  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    console.log("fetchNeighborhoods");

    // Fetch all restaurants
    restaurants = self.restaurants;
    console.log(restaurants);

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
    console.log("fetchCuisines");
    restaurants = self.restaurants;
    console.log(restaurants);

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
    console.log("urlForRestaurant");
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image and x2 URL.
   */
  static imageUrlForRestaurant(restaurant) {
    console.log("imageUrlForRestaurant");
    //console.log('img',`/img/${restaurant.photograph}`);
    if(!restaurant.photograph) restaurant.photograph = "10";
    return (`/img/${restaurant.photograph}.jpg`);
  }
  /**
   * Restaurant x1 image URL.
   */
  static imageUrlForRestaurantx1(restaurant) {
    console.log("imageUrlForRestaurantx1");
    //console.log(`${restaurant.photographx1}`);
    if(!restaurant.photograph) restaurant.photograph = "10";
    return (`/img/${restaurant.photograph}x1.jpg`);
  }
  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    console.log("mapMarkerForRestaurant");

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
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}

