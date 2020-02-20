app.service('dbCall', function ($http, $q) {
    dbCall = this;
    var db = new Dexie("noted");

    this.setupData = function() {
        return $q(function(resolve, reject){


            db.version(2).stores({
                notes: '++note_id, title, notes, date_added, categories_id, date_due, complete, photo, starred, status_id, add_to_calendar, calendar_id, parent_note_id',
                categories: '++category_id, category_name, category_colour',
                noted_settings: '++settings_id, add_to_calendar_default, allow_notifications, allow_calendar_integration, show_5_days, show_priority_list, show_status_tracker',
                status: '++status_id, status_name, class_name',
                version: '++version_id, version, release_date'
            });

            db.on('populate', function() {
                db.noted_settings.put({add_to_calendar_default: 0, allow_notifications: 0, allow_calendar_integration: 0, show_5_days: 0, show_priority_list: 0, show_status_tracker: 0});
                db.status.bulkPut([
                    {status_name: "Created", class_name: "btn-secondary"},
                    {status_name: "In Progress", class_name: "btn-success"},
                    {status_name: "Waiting", class_name: "btn-warning"},
                    {status_name: "On Hold", class_name: "btn-primary"},
                    {status_name: "Cancelled", class_name: "btn-danger"}
                ])
            });


            db.open().catch(function(e){
                console.error("Open failed: " + e.stack)
            });

            resolve("done")
        })
    };

    this.getAllData = function(storeName){
        return $q(function(resolve, reject){
            db.transaction("rw", db[storeName], function(){
                resolve(db[storeName].toArray())
            });
        })
    };



//
//    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
//    // DON'T use "var indexedDB = ..." if you're not in a function.
//    // Moreover, you may need references to some window.IDB* objects:
//    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
//    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
//    // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
//
//    // Let us open our database
//    var dbVersion = 1;
//    var dbName = "notedDB"
//    var request = window.indexedDB.open(dbName, dbVersion);
//
//    request.onerror = function(event) {
//        console.log("Why didn't you allow my web app to use IndexedDB?!");
//    };
//    request.onsuccess = function(event) {
//        db = event.target.result;
//        console.log("success: " + db);
//        db.onerror = function(event) {
//            // Generic error handler for all errors targeted at this database's requests!
//            console.log("Database error: " + event.target.errorCode);
//        };
//    };
//
//    request.onupgradeneeded = function(event) {
//        db = event.target.result;
//        console.log("upgraded DB");
//        // Create an objectStore to hold note data
//        if(!db.objectStoreNames.contains("notes")) {
//            console.log("I need to make the notes objectstore");
//            var noteObjectStore = db.createObjectStore("notes", { keyPath: "note_id", autoIncrement:true });
//            noteObjectStore.createIndex("categories_id", "categories_id", { unique: false });
//            noteObjectStore.createIndex("note_id", "note_id", { unique: true });
//        }
//
//        // Create an objectStore to hold category data
//        if(!db.objectStoreNames.contains("categories")) {
//            console.log("I need to make the categories objectstore");
//            var catObjectStore = db.createObjectStore("categories", { keyPath: "category_id", autoIncrement:true });
//            catObjectStore.createIndex("category_id", "category_id", { unique: true });
//        }
//
//        // "note_id" as our key path
//        if(!db.objectStoreNames.contains("status")) {
//            console.log("I need to make the status objectstore");
//            var statObjectStore = db.createObjectStore("status", { keyPath: "status_id", autoIncrement:true });
//        }
//
//        if(!db.objectStoreNames.contains("settings")) {
//            console.log("I need to make the settings objectstore");
//            var settingsObjectStore = db.createObjectStore("settings", { keyPath: "settings_id", autoIncrement:true });
//            settingsObjectStore.createIndex("settings_id", "settings_id", { unique: true });
//            settingsObjectStore.transaction.oncomplete = function(event) {
//                var objectSettings = [{add_to_calendar_default: 0, allow_notifications: 0, allow_calendar_integration: 0}];
//                var objectObjectStore = db.transaction("settings", "readwrite").objectStore("settings");
//                objectSettings.forEach(function(setting) {
//                    objectObjectStore.add(setting);
//                });
//            };
//        }
//
//        // Create an objectStore to hold status data
//        if(!db.objectStoreNames.contains("version")) {
//            console.log("I need to make the version objectstore");
//
//            var verObjectStore = db.createObjectStore("version", { keyPath: "version_id", autoIncrement:true });
//            verObjectStore.transaction.oncomplete = function(event) {
//                //add all the data
//                console.log("I am now adding the data");
//                var objectVersions = [{version: "1.55", release_date: "18/10/2018"}];
//                var versionObjectStore = db.transaction("version", "readwrite").objectStore("version");
//                objectVersions.forEach(function(version) {
//                    versionObjectStore.add(version);
//                });
//
//                var objectStatuses = [{status_name: "Created", class_name: "btn-secondary"},{status_name: "In progress", class_name: "btn-success"}, {status_name: "Waiting", class_name: "btn-warning"}, {status_name: "On hold", class_name: "btn-primary"}, {status_name: "Cancelled", class_name: "btn-danger"}]
//                var statusObjectStore = db.transaction("status", "readwrite").objectStore("status");
//                objectStatuses.forEach(function(status) {
//                    statusObjectStore.add(status);
//                });
//
//                var objectSettings = [{add_to_calendar_default: 0, allow_notifications: 0, allow_calendar_integration: 0}];
//                var objectObjectStore = db.transaction("settings", "readwrite").objectStore("settings");
//                objectSettings.forEach(function(setting) {
//                    objectObjectStore.add(setting);
//                });
//            };
//        }
//    };
//
//    var queryExample = {
//        select: "notes",
//        joins: [
//            {
//                pri_table: 'notes',
//                pri_col: 'categories_id',
//                other_table: 'categories',
//                other_col: 'category_id'
//            }
//        ],
//        where: [
//            {
//                field: "note_id",
//                operator: "=",
//                value: "0"
//            }
//        ]
//    };
//
//    this.getSQLData = function(query) {
//        return $q(function (resolve, reject) {
//            var DBOpenReq = window.indexedDB.open(dbName, dbVersion);
//            DBOpenReq.onsuccess = function (event) {
//                db = event.target.result;
//                if (query.select) {
//                    var transaction = db.transaction([query.select]);
//                    var objectStore = transaction.objectStore(query.select);
//                    var results = [];
//                    if (query.where.length > 0){
//                        var myIndex = objectStore.index(whereField);
//
//                        var request = myIndex.openCursor(IDBKeyRange.only(id)).onsuccess = function(event){
//                            var cursor = event.target.result;
//                            if (cursor) {
//                                results.push(cursor.value);
//                                cursor.continue();
//                            } else {
//                                resolve(results)
//                            }
//                        };
//                    } else {
//                        objectStore.openCursor().onsuccess = function(event){
//                            var cursor = event.target.result;
//                            if (cursor) {
//                                results.push(cursor.value);
//                                cursor.continue();
//                            } else {
//                                resolve(results)
//                            }
//                        };
//                    }
//                }
//            }
//        });
//    };
//
//    this.getJoinedData = function(stores, primary_id, primary_column, joins){
//        //stores has [primary, secondary, tertiary]
//        //primary_id is for the id of the primary table
//        //joins is an array of {pri_table: 'notes', pri_col: 'name', other_table: 'category', other_col: 'name'}
//        return $q(function (resolve, reject) {
//            dbCall.getAllData(stores[0], primary_column, primary_id).then(function(primaryData){
//                dbCall.getAllTables(stores.slice(1)).then(function(response){
//                    resolve(primaryData);
//                    primaryData.forEach(function(row){
//                        var fullObject = {};
//                        joins.forEach(function(join){
//                            var otherIndex = stores.indexOf(join.other_table) - 1;
//                            response[otherIndex].forEach(function(linkedRow){
//                                if (linkedRow[join.other_col] === row[join.pri_col]){
//                                    fullObject = Object.assign(row, linkedRow)
//                                }
//                            })
//                        })
//                    });
//                })
//            })
//        });
//    };
//
//    this.getAllTables = function(stores){
//        return $q(function (resolve, reject) {
//            var allPromises = [];
//            stores.forEach(function(store){
//                var promise = dbCall.getAllData(store);
//                allPromises.push(promise)
//            });
//            $q.all(allPromises).then(function(data){
//                resolve(data)
//            })
//        })
//    };
//
//    this.getIndividualData = function(store, id){
//        return $q(function (resolve, reject) {
//            var DBOpenReq = window.indexedDB.open(dbName, dbVersion);
//            DBOpenReq.onsuccess = function (event) {
//                db = event.target.result;
//                if (store) {
//                    var transaction = db.transaction([store]);
//                    var objectStore = transaction.objectStore(store);
//                    var request = objectStore.get(id);
//                    request.onerror = function (event) {
//                        alert("Unable to retrieve data from database!");
//                    };
//
//                    request.onsuccess = function (event) {
//                        if (request.result) {
//                            resolve(request.result)
//                        } else {
//                            console.log("Entry not in database");
//                        }
//                    };
//                }
//            }
//        });
//    };
//
//    this.getAllData = function(store, whereField, id){
//        return $q(function (resolve, reject) {
//            var DBOpenReq = window.indexedDB.open(dbName, dbVersion);
//            DBOpenReq.onsuccess = function (event) {
//                db = event.target.result;
//                if (store) {
//                    var transaction = db.transaction([store]);
//                    var objectStore = transaction.objectStore(store);
//                    var results = [];
//                    if (whereField){
//                        var myIndex = objectStore.index(whereField);
//
//                        var request = myIndex.openCursor(IDBKeyRange.only(id)).onsuccess = function(event){
//                            var cursor = event.target.result;
//                            if (cursor) {
//                                results.push(cursor.value);
//                                cursor.continue();
//                            } else {
//                                resolve(results)
//                            }
//                        };
//                    } else {
//                        objectStore.openCursor().onsuccess = function(event){
//                            var cursor = event.target.result;
//                            if (cursor) {
//                                results.push(cursor.value);
//                                cursor.continue();
//                            } else {
//                                resolve(results)
//                            }
//                        };
//                    }
//                }
//            }
//        });
//    };
//
//    this.add = function(store, data){
//        return $q(function (resolve, reject) {
//            var DBOpenReq = window.indexedDB.open(dbName, dbVersion);
//            DBOpenReq.onsuccess = function (event) {
//                db = event.target.result;
//                if (data) {
//                    var request = db.transaction([store], "readwrite")
//                        .objectStore(store)
//                        .add( data );
//                    request.onsuccess = function(event) {
//                        resolve({insertId: event.target.result});
//                    };
//
//                    request.onerror = function(event) {
//                        alert("Unable to add data");
//                        reject("error: " + event)
//                    };
//                }
//            }
//        });
//    };
//
//    this.update = function(store, id, data, whereField){
//        return $q(function (resolve, reject) {
//            var DBOpenReq = window.indexedDB.open(dbName, dbVersion);
//            DBOpenReq.onsuccess = function (event) {
//                db = event.target.result;
//                if (store && data) {
//                    var objectStore = db.transaction([store], "readwrite").objectStore(store);
//                    if (whereField){
//                        var myIndex = objectStore.index(whereField);
//                        var request = myIndex.openCursor(IDBKeyRange.only(id)).onsuccess = function(event){
//                            var cursor = event.target.result;
//                            if (cursor) {
//                                var valueFromDB = cursor.value;
//
//                                //data will arrive as an array of arrays [[fieldName, value], [fieldName, value]]
//                                data.forEach(function(field){
//                                    valueFromDB[field[0]] = field[1]
//                                });
//
//                                // Put this updated object back into the database.
//                                var requestUpdate = objectStore.put(valueFromDB);
//                                requestUpdate.onerror = function(event) {
//                                    reject("Error: " + event)
//                                };
//                                requestUpdate.onsuccess = function(event) {
//                                    resolve("Success")
//                                };
//                                cursor.continue();
//                            } else {
//                                resolve("Success")
//                            }
//                        };
//                    } else {
//                        //no where clause so go for the main id
//                        var request = objectStore.get(id);
//                        request.onsuccess = function(event) {
//                            // Get the old value that we want to update
//                            var valueFromDB = event.target.result;
//
//                            //data will arrive as an array of arrays [[fieldName, value], [fieldName, value]]
//                            data.forEach(function(field){
//                                valueFromDB[field[0]] = field[1]
//                            });
//
//                            // Put this updated object back into the database.
//                            var requestUpdate = objectStore.put(valueFromDB);
//                            requestUpdate.onerror = function(event) {
//                                reject("Error: " + event)
//                            };
//                            requestUpdate.onsuccess = function(event) {
//                                resolve("Success")
//                            };
//                        };
//                    }
//                    request.onerror = function(event) {
//                        reject("Error: " + event)
//                    };
//                }
//            }
//        });
//    };
//
//    this.remove = function(store, id){
//        return $q(function (resolve, reject) {
//            var DBOpenReq = window.indexedDB.open(dbName, dbVersion);
//            DBOpenReq.onsuccess = function (event) {
//                db = event.target.result;
//                if (store) {
//                    var request = db.transaction([store], "readwrite")
//                        .objectStore(store)
//                        .delete(id);
//                    request.onsuccess = function(event) {
//                        resolve("Removed");
//                    };
//                }
//            }
//        });
//    };
});