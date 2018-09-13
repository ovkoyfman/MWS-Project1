var dbPromise = idb.open('restaurants', 1, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        var keyValStore =  upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
        keyValStore.put("world", "hello");
      case 1:
      var keyValStore = upgradeDb.createObjectStore('restaurantsReviews', {keyPath: 'id'});
      keyValStore.put("world", "hello");
    }
});