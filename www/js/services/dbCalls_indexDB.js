app.service('dbCall', function ($http, $q) {
    dbCall = this;

    this.setupData = function() {
        console.log("database setting up")
    };
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // DON'T use "var indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

    // Let us open our database
    var dbVersion = 1;
    var dbName = "notedDB"
    var request = window.indexedDB.open(dbName, dbVersion);
    var db;

    request.onerror = function(event) {
        console.log("Why didn't you allow my web app to use IndexedDB?!");
    };
    request.onsuccess = function(event) {
        db = event.target.result;
        console.log("success: " + db);
        db.onerror = function(event) {
            // Generic error handler for all errors targeted at this database's requests!
            console.log("Database error: " + event.target.errorCode);
        };
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        console.log("upgraded DB");
        // Create an objectStore to hold note data
        if(!db.objectStoreNames.contains("notes")) {
            console.log("I need to make the notes objectstore");
            var noteObjectStore = db.createObjectStore("notes", { keyPath: "note_id", autoIncrement:true });
            noteObjectStore.createIndex("categories_id", "categories_id", { unique: false });
            noteObjectStore.createIndex("note_id", "note_id", { unique: true });
        }

        // Create an objectStore to hold category data
        if(!db.objectStoreNames.contains("categories")) {
            console.log("I need to make the categories objectstore");
            var catObjectStore = db.createObjectStore("categories", { keyPath: "category_id", autoIncrement:true });
            catObjectStore.createIndex("category_id", "category_id", { unique: true });
        }

        // "note_id" as our key path
        if(!db.objectStoreNames.contains("status")) {
            console.log("I need to make the status objectstore");
            var statObjectStore = db.createObjectStore("status", { keyPath: "status_id", autoIncrement:true });
        }

        if(!db.objectStoreNames.contains("settings")) {
            console.log("I need to make the settings objectstore");
            var settingsObjectStore = db.createObjectStore("settings", { keyPath: "settings_id", autoIncrement:true });
            settingsObjectStore.createIndex("settings_id", "settings_id", { unique: true });
            settingsObjectStore.transaction.oncomplete = function(event) {
                var objectSettings = [{add_to_calendar_default: 0, allow_notifications: 0, allow_calendar_integration: 0}];
                var objectObjectStore = db.transaction("settings", "readwrite").objectStore("settings");
                objectSettings.forEach(function(setting) {
                    objectObjectStore.add(setting);
                });
            };
        }

        // Create an objectStore to hold status data
        if(!db.objectStoreNames.contains("version")) {
            console.log("I need to make the version objectstore");

            var verObjectStore = db.createObjectStore("version", { keyPath: "version_id", autoIncrement:true });
            verObjectStore.transaction.oncomplete = function(event) {
                //add all the data
                console.log("I am now adding the data");
                var objectVersions = [{version: "1.55", release_date: "18/10/2018"}];
                var versionObjectStore = db.transaction("version", "readwrite").objectStore("version");
                objectVersions.forEach(function(version) {
                    versionObjectStore.add(version);
                });

                var objectStatuses = [{status_name: "Created", class_name: "btn-secondary"},{status_name: "In progress", class_name: "btn-success"}, {status_name: "Waiting", class_name: "btn-warning"}, {status_name: "On hold", class_name: "btn-primary"}, {status_name: "Cancelled", class_name: "btn-danger"}]
                var statusObjectStore = db.transaction("status", "readwrite").objectStore("status");
                objectStatuses.forEach(function(status) {
                    statusObjectStore.add(status);
                });

                var objectSettings = [{add_to_calendar_default: 0, allow_notifications: 0, allow_calendar_integration: 0}];
                var objectObjectStore = db.transaction("settings", "readwrite").objectStore("settings");
                objectSettings.forEach(function(setting) {
                    objectObjectStore.add(setting);
                });
            };
        }
    };

    this.getJoinedData = function(stores, primary_id, primary_column, joins){
        //stores has [primary, secondary, tertiary]
        //primary_id is for the id of the primary table
        //joins is an array of {pri_table: 'notes', pri_col: 'name', other_table: 'category', other_col: 'name'}
        return $q(function (resolve, reject) {
            dbCall.getAllData(stores[0], primary_column, primary_id).then(function(primaryData){
                dbCall.getAllTables(stores.slice(1)).then(function(response){
                    resolve(primaryData);
                    primaryData.forEach(function(row){
                        var fullObject = {};
                        joins.forEach(function(join){
                            var otherIndex = stores.indexOf(join.other_table) - 1;
                            response[otherIndex].forEach(function(linkedRow){
                                if (linkedRow[join.other_col] === row[join.pri_col]){
                                    fullObject = Object.assign(row, linkedRow)
                                }
                            })
                        })
                    });
                })
            })
        });
    };

    this.getAllTables = function(stores){
        return $q(function (resolve, reject) {
            var allPromises = [];
            stores.forEach(function(store){
                var promise = dbCall.getAllData(store);
                allPromises.push(promise)
            });
            $q.all(allPromises).then(function(data){
                resolve(data)
            })
        })
    };

    this.getIndividualData = function(store, id){
        return $q(function (resolve, reject) {
            var DBOpenReq = window.indexedDB.open(dbName, dbVersion);
            DBOpenReq.onsuccess = function (event) {
                db = event.target.result;
                if (store) {
                    var transaction = db.transaction([store]);
                    var objectStore = transaction.objectStore(store);
                    var request = objectStore.get(id);
                    request.onerror = function (event) {
                        alert("Unable to retrieve data from database!");
                    };

                    request.onsuccess = function (event) {
                        if (request.result) {
                            resolve(request.result)
                        } else {
                            console.log("Entry not in database");
                        }
                    };
                }
            }
        });
    };

    this.getAllData = function(store, whereField, id){
        return $q(function (resolve, reject) {
            var DBOpenReq = window.indexedDB.open(dbName, dbVersion);
            DBOpenReq.onsuccess = function (event) {
                db = event.target.result;
                if (store) {
                    var transaction = db.transaction([store]);
                    var objectStore = transaction.objectStore(store);
                    var results = [];
                    if (whereField){
                        var myIndex = objectStore.index(whereField);

                        var request = myIndex.openCursor(IDBKeyRange.only(id)).onsuccess = function(event){
                            var cursor = event.target.result;
                            if (cursor) {
                                results.push(cursor.value);
                                cursor.continue();
                            } else {
                                resolve(results)
                            }
                        };
                    } else {
                        objectStore.openCursor().onsuccess = function(event){
                            var cursor = event.target.result;
                            if (cursor) {
                                results.push(cursor.value);
                                cursor.continue();
                            } else {
                                resolve(results)
                            }
                        };
                    }
                }
            }
        });
    };

    this.add = function(store, data){
        return $q(function (resolve, reject) {
            var DBOpenReq = window.indexedDB.open(dbName, dbVersion);
            DBOpenReq.onsuccess = function (event) {
                db = event.target.result;
                if (data) {
                    var request = db.transaction([store], "readwrite")
                        .objectStore(store)
                        .add( data );
                    request.onsuccess = function(event) {
                        resolve({insertId: event.target.result});
                    };

                    request.onerror = function(event) {
                        alert("Unable to add data");
                        reject("error: " + event)
                    };
                }
            }
        });
    };

    this.update = function(store, id, data, whereField){
        return $q(function (resolve, reject) {
            var DBOpenReq = window.indexedDB.open(dbName, dbVersion);
            DBOpenReq.onsuccess = function (event) {
                db = event.target.result;
                if (store && data) {
                    var objectStore = db.transaction([store], "readwrite").objectStore(store);
                    if (whereField){
                        var myIndex = objectStore.index(whereField);
                        var request = myIndex.openCursor(IDBKeyRange.only(id)).onsuccess = function(event){
                            var cursor = event.target.result;
                            if (cursor) {
                                var valueFromDB = cursor.value;

                                //data will arrive as an array of arrays [[fieldName, value], [fieldName, value]]
                                data.forEach(function(field){
                                    valueFromDB[field[0]] = field[1]
                                });

                                // Put this updated object back into the database.
                                var requestUpdate = objectStore.put(valueFromDB);
                                requestUpdate.onerror = function(event) {
                                    reject("Error: " + event)
                                };
                                requestUpdate.onsuccess = function(event) {
                                    resolve("Success")
                                };
                                cursor.continue();
                            } else {
                                resolve("Success")
                            }
                        };
                    } else {
                        //no where clause so go for the main id
                        var request = objectStore.get(id);
                        request.onsuccess = function(event) {
                            // Get the old value that we want to update
                            var valueFromDB = event.target.result;

                            //data will arrive as an array of arrays [[fieldName, value], [fieldName, value]]
                            data.forEach(function(field){
                                valueFromDB[field[0]] = field[1]
                            });

                            // Put this updated object back into the database.
                            var requestUpdate = objectStore.put(valueFromDB);
                            requestUpdate.onerror = function(event) {
                                reject("Error: " + event)
                            };
                            requestUpdate.onsuccess = function(event) {
                                resolve("Success")
                            };
                        };
                    }
                    request.onerror = function(event) {
                        reject("Error: " + event)
                    };
                }
            }
        });
    };

    this.remove = function(store, id){
        return $q(function (resolve, reject) {
            var DBOpenReq = window.indexedDB.open(dbName, dbVersion);
            DBOpenReq.onsuccess = function (event) {
                db = event.target.result;
                if (store) {
                    var request = db.transaction([store], "readwrite")
                        .objectStore(store)
                        .delete(id);
                    request.onsuccess = function(event) {
                        resolve("Removed");
                    };
                }
            }
        });
    };
});