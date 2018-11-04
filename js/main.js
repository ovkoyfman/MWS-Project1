let restaurants,
  neighborhoods,
  cuisines,
  restaurantsFetchedData;
var newMap
var markers = [];
var neighborhoodDataFilled = false;
const altTags = [
  "Mission Chinese Food Restaurant Atmosphere",
  "A pepperoni pizza served at Emily Restaurant",
  "Serving station at Kang Ho Baekjeong",
  "Corner of Katz's Delicatessen",
  "Relaxed environment in Roberta's Pizza",
  "Homey atmosphere in Hometown BBQ",
  "Two young men standing outside the entrance to Superiority Burger",
  "Entrance to The Dutch Restaurant",
  "Young people having dinner in Mu Ramen Restaurant",
  "Airy space in Casa Enrique"
];
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */

document.addEventListener('DOMContentLoaded', (event) => {
  DBHelper.fetchRestaurants(null, function(data){
    self.restaurantsFetchedData = data;
    updateRestaurants();
  })
  if (!self.newMap) initMap(); // added 
});
var fillData = (restaurants) => {
  self.restaurants = restaurants;
  const uniq = xs => [...new Set(xs)];
  // Remove duplicates from cuisines
  const getCuisineType = ({cuisine_type} = {}) => cuisine_type;
  const allCuisines = restaurants.map(getCuisineType);
  const cuisines = uniq(allCuisines);
  console.log(cuisines);
  const getNeigborhood = ({neighborhood} = {}) => neighborhood
  const allNeighborhoods = restaurants.map(getNeigborhood)
  // Remove duplicates from neighborhoods
  const neighborhoods = uniq(allNeighborhoods);
  if(!neighborhoodDataFilled){
    fillOptionsHTML(neighborhoods, 'neighborhoods-select');
    fillOptionsHTML(cuisines, 'cuisines-select');
    neighborhoodDataFilled = true;
  }
}
/**
 * Set neighborhoods HTML.
 */
const fillOptionsHTML = (array, id) => {
  const select = document.getElementById(id);
  array.forEach(value => {
  const option = document.createElement('option');
  option.innerHTML = value;
  option.value = value;
  select.append(option);
  });
}

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
}
updateRestaurants = () => {


  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.getRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (response) => {
    resetRestaurants(response);
    fillRestaurantsHTML();
    fillData(response);
  })
}
/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {

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
  image.alt =altTags[(restaurant.id - 1)];
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
  li.append(more);
  
  const favorite = document.createElement('div');
  if(!restaurant.is_favorite) restaurant.is_favorite = false;
  favorite.className = JSON.parse(restaurant.is_favorite) ? "red":"white";
  favorite.innerHTML = '<div class="heart"></div><div class="heart-overlap"></div></div>';
  
  
  favorite.onclick = function(){
    restaurant.is_favorite = !JSON.parse(restaurant.is_favorite); 
    fetch('http://localhost:1337/restaurants/' + restaurant.id + '/?is_favorite=' + JSON.parse(restaurant.is_favorite), { method: 'PUT'}).catch(function(error){
    });
    this.className = JSON.parse(restaurant.is_favorite) ? "red":"white";
    //var dbPromise = idb.open('restaurantsDatabase');
    updateDatabase(restaurant);
  }
  li.append(favorite);
  return li;
}
var updateDatabase = function(restaurant){
  DBHelper.dbPromise().then(function(db){
    if(!db) return;
    let tx = db.transaction('restaurants','readwrite');
    tx.objectStore('restaurants').put(restaurant);
  }).catch(error => console.log(error));
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

function displayError(error){
    console.error(error);
}
