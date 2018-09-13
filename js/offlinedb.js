var dbPromise = idb.open('restaurants', 1, function(upgradeDb) {
        var keyValStore =  upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
});