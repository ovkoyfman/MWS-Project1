let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  console.log(self.restaurants)
  initMap(); // added 
  //fetchNeighborhoods();
  //fetchCuisines();
  //setTimeout(function(){ makeAllListingSameHeight(); }, 3000);
});
// if(navigator.serviceWorker){
//   navigator.serviceWorker.register('/sw.js');
// }
/**
 * Fetch all neighborhoods and set their HTML.
 */
// var fetchNeighborhoods = () => {
//   DBHelper.fetchNeighborhoods((neighborhoods) => {
//       self.neighborhoods = neighborhoods;
//       fillNeighborhoodsHTML();
//   });
// }
var fillData = (restaurants) => {
  self.restaurants = restaurants;
  console.log("1",restaurants);
  const allCuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
  // Remove duplicates from cuisines
  const cuisines = allCuisines.filter((v, i) => allCuisines.indexOf(v) == i)
  const allNeighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
  // Remove duplicates from neighborhoods
  const neighborhoods = allNeighborhoods.filter((v, i) => allNeighborhoods.indexOf(v) == i)
  //self.neighborhoods = neighborhoods;
  //self.cuisines = cuisines;
  fillNeighborhoodsHTML(neighborhoods);
  fillCuisinesHTML(cuisines);
}
/**
 * Set neighborhoods HTML.
 */
var fillNeighborhoodsHTML = (neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
// fetchCuisines = () => {
//   DBHelper.fetchCuisines((cuisines) => {
//     self.cuisines = cuisines;
//     fillCuisinesHTML();
//   });
// }

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1Ijoib2tveWZtYW4iLCJhIjoiY2ppc3Z0NDY4MGs2OTN3bG9wNXBpYXlwNSJ9.MpI8pnoEx-gQVFY5HTy7iQ',
    //mapboxToken: '<your MAPBOX API KEY HERE>',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  console.log(1);
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (response) => {
    resetRestaurants(response);
    fillRestaurantsHTML();
    fillData(response)
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  console.log(restaurants);
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imageUrlForRestaurantx1(restaurant) + ' 400w, ' + DBHelper.imageUrlForRestaurant(restaurant) + ' 800w';
  image.sizes = "(max-width: 575px) 85vw, (max-width: 991px) 43vw, (min-width: 992px) 30vw";
  image.alt ="Image of " + restaurant.name + " Restaurant";
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');

  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('button');
  more.innerHTML = 'View Details';
  more.onclick = function(){window.open(DBHelper.urlForRestaurant(restaurant), "_self")};
  li.append(more)

  return li
}
/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
} 

/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */
function displayError(error){
    console.error(error);
}
