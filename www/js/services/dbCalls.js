app.service('dbCall', function ($http, $q) {

    var myDB = openDatabase("Memos.db", "default", "Desc", "1000");

    //function to return an array of the rows returned from the query.
    this.getData = function (query, params = []) {
        //console.log("Transaction Query : " + query);
        return $q(function (resolve, reject) {
            myDB.transaction(function (transaction) {
                transaction.executeSql(query, params, function (transaction, result) {
                    var resultsArray = [];
                    for (var i = 0; i < result.rows.length; i++) {
                        resultsArray.push(result.rows[i])
                    }
                    resolve(resultsArray);
                }, nullHandler, errorHandler);
            });
        });
    };

    //function to modify data in the database
    this.modifyData = function (query, params = []) {
        //console.log("Transaction Query : " + query);
        return $q(function (resolve, reject) {
            myDB.transaction(function (transaction) {
                transaction.executeSql(query, params, function (transaction, result) {
                    resolve(result);
                }, nullHandler, errorHandler);
            });
        });
    };

    function nullHandler(error) {
        //console.log(error);
    }

    function errorHandler(error) {
        //console.log("error handler: " + error);
    }

    //function for setting up the tables
    function doDBTransaction(SQL, params, resultMsg, errorMsg) {
        //console.log(SQL)
        return $q(function (resolve, reject) {
            myDB.transaction(function (transaction) {
                transaction.executeSql(SQL, params,
                    function (tx, result) {
                        //console.log(resultMsg);
                        resolve(result);
                    },nullHandler, errorHandler);
            });
        });
    }

    //sets up the database tables
    this.setupData = function() {
        return $q(function (resolve, reject) {
            //add databases
            var prom1 = doDBTransaction("CREATE TABLE IF NOT EXISTS notes (note_id integer primary key, title text, notes text, date_added text default current_timestamp, categories_id integer, date_due text, complete integer default(0), photo text)", [], "Notes table created", "Notes table not created")
            var prom2 = doDBTransaction("CREATE TABLE IF NOT EXISTS categories (category_id integer primary key, category_name text, category_colour text, CONSTRAINT name_unique UNIQUE (category_name))", [], "Categories table created", "Categories table not created")
            var prom3 = doDBTransaction("CREATE TABLE IF NOT EXISTS version (version_id integer primary key, version text, release_date text)", [], "Version table created", "Version table not created");
            var prom4 = doDBTransaction("CREATE TABLE IF NOT EXISTS status (status_id integer primary key, status_name text, class_name text)", [], "Status table created", "Status table not created");

            //version 1.2 database changes
            var prom5 = doDBTransaction("ALTER TABLE notes add column starred integer default(0)", [], "starred added to notes table", "starred already in notes table");
            var prom6 = doDBTransaction("ALTER TABLE notes add column status_id integer default(1)", [], "status added to notes table", "status already in notes table");

            //version 1.6 database changes
            var prom7 = doDBTransaction("UPDATE notes set categories_id = -1 where (categories_id = '') OR (categories_id IS NULL) OR (categories_id = '0')", [], "updated notes categories", "notes could not be updated");
            var prom8 = doDBTransaction("ALTER TABLE notes add column add_to_calendar integer", [], "add_to_calendar added to notes table", "add_to_calendar already in notes table");
            var prom9 = doDBTransaction("ALTER TABLE notes add column calendar_id integer", [], "calendar_id added to notes table", "calendar_id already in notes table");
            //doDBTransaction("DROP TABLE settings", [], "", "")
            //doDBTransaction("DROP TABLE noted_settings", [], "", "")
            var prom10 = doDBTransaction("CREATE TABLE IF NOT EXISTS noted_settings (settings_id integer primary key, add_to_calendar_default integer default(0), allow_notifications integer default(0), allow_calendar_integration integer default(0))", [], "Status table created", "Status table not created");
            var prom11 = doDBTransaction("select * from noted_settings where settings_id = ?", [1], "settings checked", "settings unable to be checked").then(function (res) {
                if (res.rows.length === 0) {
                    doDBTransaction("INSERT INTO noted_settings (add_to_calendar_default, allow_notifications, allow_calendar_integration) values(?,?,?)", [0,0,0], "settings added to the DB", "settings cannot be added to db");
                }
                resolve(res)
            });


            //insert the statuses into the status table
            var prom12 = doDBTransaction("select * from status", [], "status DB queried", "status DB unable to be queried").then(function (res) {
                if (res.rows.length === 0) {
                    doDBTransaction("INSERT INTO status (status_name, class_name) values(?,?)", ["Created", "btn-secondary"], "status added to the DB", "status cannot be added to db");
                    doDBTransaction("INSERT INTO status (status_name, class_name) values(?,?)", ["In progress", "btn-success"], "status added to the DB", "status cannot be added to db");
                    doDBTransaction("INSERT INTO status (status_name, class_name) values(?,?)", ["Waiting", "btn-warning"], "status added to the DB", "status cannot be added to db");
                    doDBTransaction("INSERT INTO status (status_name, class_name) values(?,?)", ["On hold", "btn-primary"], "status added to the DB", "status cannot be added to db");
                    doDBTransaction("INSERT INTO status (status_name, class_name) values(?,?)", ["Cancelled", "btn-danger"], "status added to the DB", "status cannot be added to db");
                }
                resolve(res)
            });

            //update the version number
            var prom13 = doDBTransaction("select * from version where version = ?", ["1.82"], "version number checked", "version number unable to be checked").then(function (res) {
                if (res.rows.length === 0) {
                    doDBTransaction("INSERT INTO version (version, release_date) values(?,?)", ["1.82", "26/10/2018"], "version added to the DB", "version cannot be added to db");
                }
                resolve(res)
            });
            $q.all([prom1, prom2, prom3, prom4, prom5, prom6, prom7, prom8, prom9, prom10, prom11, prom12, prom13]).then(function(promises){
                resolve("All Done")
            })
        })
    }
});
/*
Version 1.7 - 24th Oct
Added totals for the priority and uncategorised lists
Added settings to allow desktop use as can turn off notifications/calendar etc
Added padding on edit screen
Fixed quick links: New Note and Priority List

Version 1.8 - 24th Oct
Added next 5 day summary - need to add totals to these

Version 1.81 - 26th Oct
Fixed settings bug caused when 1.6 - 1.8 upgrade. Renamed settings table and added promise handling to the setup so that the settings are loaded

Version 1.82 - 26th Oct
Speed optimisations, removed redundant code, switched code where possible to make run faster.
Added "$scope.$on('$viewContentLoaded', function()" for all controllers to minimise the calls
Added button to show completed tasks which show below.
Added colours to the calendar view

*/