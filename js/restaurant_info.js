let restaurant;
var newMap;
/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((restaurant) => {     
    self.newMap = L.map('map', {
      center: [restaurant.latlng.lat, restaurant.latlng.lng],
      zoom: 16,
      scrollWheelZoom: false
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
      mapboxToken: 'pk.eyJ1Ijoib2tveWZtYW4iLCJhIjoiY2ppc3Z0NDY4MGs2OTN3bG9wNXBpYXlwNSJ9.MpI8pnoEx-gQVFY5HTy7iQ',
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'    
    }).addTo(newMap);
    fillBreadcrumb();
    DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
  });
}  

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  const id = getParameterByName('id');
  DBHelper.fetchRestaurants(id, function(data){
    self.restaurantsFetchedData = data;
    if (self.restaurant) { // restaurant already fetched!
      callback(self.restaurant)
      return;
    }
    restaurant = restaurantsFetchedData;
    self.restaurant = restaurant;
    fillRestaurantHTML();
    callback(restaurant)
  });
}
/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  const favorite = document.getElementById('favorite');
  if(!restaurant.is_favorite) restaurant.is_favorite = false;
  favorite.innerHTML = JSON.parse(restaurant.is_favorite) ? "Favorite":"Like it!";
  this.className = JSON.parse(restaurant.is_favorite) ? "favorite" : "";
  favorite.onclick = function(){
    restaurant.is_favorite = !JSON.parse(restaurant.is_favorite); 
    fetch('http://localhost:1337/restaurants/' + restaurant.id + '/?is_favorite=' + JSON.parse(restaurant.is_favorite), { method: 'PUT'}).catch(function(error){
    });
    favorite.innerHTML = JSON.parse(restaurant.is_favorite) ? "Favorite":"Like it!";
    //var dbPromise = idb.open('restaurantsDatabase');
    updateDatabase(restaurant);
  }
  var updateDatabase = function(restaurant){
    DBHelper.dbPromise().then(function(db){
      if(!db) return;
      let tx = db.transaction('restaurants','readwrite');
      tx.objectStore('restaurants').put(restaurant);
    }).catch(error => console.log(error));
  }
  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt ="Image of " + restaurant.name + " Restaurant";

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  const id = document.getElementById('restaurant-id');
  id.value = restaurant.id;
  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  let reviewsArray = [];
  DBHelper.dbPromise().then(function(db){
    let reviews = db.transaction('reviews').objectStore('reviews').getAll();
    reviews.then(data => {
      data.forEach(function(review){
        if(review.restaurant_id == restaurant.id) reviewsArray.push(review);
      });
      fillReviewsHTML(reviewsArray);
    }).catch(error=>{console.log(error)});
  }).catch(error=>{console.log(error)});
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  if(!review.createdAt) review.createdAt = new Date();
  var myDate = new Date(review.createdAt)
  date.innerHTML = (myDate.getMonth()+1) + "/" + myDate.getDate() + "/" + myDate.getFullYear();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}
function postReview() { 
	const id = getParameterByName('id'); 
	const username = document.getElementById("review-name").value; 
	const rating = document.getElementById("review-rating").value; 
  const content = document.getElementById("review-content").value;
  let nextReviewId = parseInt(localStorage.getItem('id')) + 1;
  localStorage.setItem('id', nextReviewId);
	const review = { 
    "id": nextReviewId,
		"restaurant_id": id, 
		"name": username, 
		"rating": rating, 
    "comments": content
	}
	fetch(
		'http://localhost:1337/reviews/', {
			method: 'POST', 
			body: JSON.stringify(review), 
			headers: { 'content-type': 'application/json' 
		} 
  }).then(response => response.json()).then(response => { 
    if(!db){return;} 
    db.transaction('reviews','readwrite').objectStore('reviews').put(review);
  }).catch(error => {
    DBHelper.dbPromise().then(function(db){
      console.log(error);
      if(!db){return;} 
      db.transaction('unpostedReviews','readwrite').objectStore('unpostedReviews').put(review);
      db.transaction('reviews','readwrite').objectStore('reviews').put(review);
    });
  }); 
  location.reload();
 }
/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}