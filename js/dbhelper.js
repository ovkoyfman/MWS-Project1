/**
 * Common database helper functions.
 */
let nextReviewId = 0;
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
  static dbPromise() {
    return idb.open('restaurantsDatabase', 3, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
      case 1:
        upgradeDb.createObjectStore('reviews', {keyPath: 'id'});
      case 2:
        upgradeDb.createObjectStore('unpostedReviews', {keyPath: 'id'});
     }
   });
  }
  static fetchRestaurants(id,callback){
    DBHelper.postPendingReviewIfOnline();
    var url;
    if(!id){ 
    url = DBHelper.DATABASE_URL;
    //fetch restaurants
    fetch(url).then(function(response) { 
      var restaurants = response.json();
      //open database
       DBHelper.dbPromise().then(
        function(db){
        if(!db) return;
        //var store = db.transaction('restaurants','readwrite').objectStore('restaurants');
        restaurants.then(function(data){
          data.forEach(function(restaurant){
            //get reviews
            fetch('http://localhost:1337/reviews/?restaurant_id=' + restaurant.id).then(function(data){ return data.json();}).then(function(data){
              var reviews = data;
              nextReviewId+= reviews.length;
              //restaurant.reviews = reviews;
              //post reviews to the reviews table
              reviews.forEach(function(review){
                db.transaction('reviews','readwrite').objectStore('reviews').put(review);
              })
              localStorage.setItem('id', nextReviewId);
            }).then(function(){
              db.transaction('restaurants','readwrite').objectStore('restaurants').put(restaurant);
              //if it's last restaurant
              if (data.length == restaurant.id){
                var tx = db.transaction('restaurants','readonly').objectStore('restaurants').getAll();
                if(id) return tx.then(function(data){callback(data[id-1])});
                else  return tx.then(function(data){if(data.length){callback(data)}}); 
              }
            })
          });
        })
      }).catch(function(error){
        console.log(error)
      })
    }).catch(function(error){
      console.log(error);
      DBHelper.dbPromise().then(function(db){
        var dbTransection = db.transaction('restaurants','readonly').objectStore('restaurants').getAll();
        if(id) return dbTransection.then(function(data){callback(data[id-1])});
        else  return dbTransection.then(function(data){if(data.length){callback(data)}});
      })
    });;
    }
    else{
      url = DBHelper.DATABASE_URL + "/" + id;
    //fetch restaurants
    fetch(url).then(function(response) { 
      var restaurant = response.json();
      //open database
      DBHelper.dbPromise().then(function(db){
        if(!db) return;
        //var store = db.transaction('restaurants','readwrite').objectStore('restaurants');
        
        restaurant.then(function(data){
            //get reviews
            fetch('http://localhost:1337/reviews/?restaurant_id=' + id).then(function(data){ return data.json();}).then(function(data){
              var reviews = data;
              nextReviewId = parseInt(localStorage.getItem('id'));
              //restaurant.reviews = reviews;
              //post reviews to the reviews table
              reviews.forEach(function(review){
                db.transaction('reviews','readwrite').objectStore('reviews').put(review);
              })
              localStorage.setItem('id', nextReviewId);
            }).then(function(){
              db.transaction('restaurants','readwrite').objectStore('restaurants').put(data);
               callback(data);
              })
        })
      }).catch(function(error){
        console.log(error)
      })
    }).catch(function(error){
        DBHelper.dbPromise().then(function(db){
          var dbTransection = db.transaction('restaurants','readonly').objectStore('restaurants').getAll();
          if(id) return dbTransection.then(function(data){callback(data[id-1])});
          else  return dbTransection.then(function(data){if(data.length){callback(data)}});
        })
      });;
    }
   }
  static postPendingReviewIfOnline() {
    DBHelper.dbPromise().then(function(db){
      if(!db) return;
      //get all unposted reviews
      let tx = db.transaction('unpostedReviews').objectStore('unpostedReviews').getAll();
      //if anything is there, post it online and deledte, if connection is unsuccessful, error  will be thrown and unposted revies will stay in database
      tx.then(data => {
        if (data.length) data.forEach(function(unpostedReview){
          fetch(
            'http://localhost:1337/reviews/', {
              method: 'POST', 
              body: JSON.stringify(unpostedReview), 
              headers: { 'content-type': 'application/json' 
            } 
          }).then(response => {
            response.json();
            db.transaction('unpostedReviews','readwrite').objectStore('unpostedReviews').delete(unpostedReview.id); 
          }).then(response => { 
          }).catch(error => {console.log(error)});
        })
      })
    });
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

