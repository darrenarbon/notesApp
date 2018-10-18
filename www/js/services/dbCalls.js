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
        //console.log("null handler");
    }

    function errorHandler(error) {
        //console.log("error handler");
    }

    //function for setting up the tables
    function doDBTransaction(SQL, params, resultMsg, errorMsg) {
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

        //add databases
        doDBTransaction("CREATE TABLE IF NOT EXISTS notes (note_id integer primary key, title text, notes text, date_added text default current_timestamp, categories_id integer, date_due text, complete integer default(0), photo text)", [], "Notes table created", "Notes table not created")
        doDBTransaction("CREATE TABLE IF NOT EXISTS categories (category_id integer primary key, category_name text, category_colour text, CONSTRAINT name_unique UNIQUE (category_name))", [], "Categories table created", "Categories table not created")
        doDBTransaction("CREATE TABLE IF NOT EXISTS version (version_id integer primary key, version text, release_date text)", [], "Version table created", "Version table not created");
        doDBTransaction("CREATE TABLE IF NOT EXISTS status (status_id integer primary key, status_name text, class_name text)", [], "Status table created", "Status table not created");

        //version 1.2 database changes
        doDBTransaction("ALTER TABLE notes add column starred integer default(0)", [], "starred added to notes table", "starred already in notes table");
        doDBTransaction("ALTER TABLE notes add column status_id integer default(1)", [], "status added to notes table", "status already in notes table");

        //version 1.5 database changes

        //insert the statuses into the status table
        doDBTransaction("select * from status", [], "status DB queried", "status DB unable to be queried").then(function(res){
            if (res.rows.length === 0){
                doDBTransaction("INSERT INTO status (status_name, class_name) values(?,?)", ["Created", "btn-secondary"], "status added to the DB", "status cannot be added to db");
                doDBTransaction("INSERT INTO status (status_name, class_name) values(?,?)", ["In progress", "btn-success"], "status added to the DB", "status cannot be added to db");
                doDBTransaction("INSERT INTO status (status_name, class_name) values(?,?)", ["Waiting", "btn-warning"], "status added to the DB", "status cannot be added to db");
                doDBTransaction("INSERT INTO status (status_name, class_name) values(?,?)", ["On hold", "btn-primary"], "status added to the DB", "status cannot be added to db");
                doDBTransaction("INSERT INTO status (status_name, class_name) values(?,?)", ["Cancelled", "btn-danger"], "status added to the DB", "status cannot be added to db");
            }
        });

        //update the version number
        doDBTransaction("select * from version where version = ?", ["1.55"], "version number checked", "version number unable to be checked").then(function(res){
            if (res.rows.length === 0){
                doDBTransaction("INSERT INTO version (version, release_date) values(?,?)", ["1.55", "18/10/2018"], "version added to the DB", "version cannot be added to db");
            }
        });
    }
});