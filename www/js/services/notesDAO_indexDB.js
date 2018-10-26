app.service('NotesDAO', function ($q, dbCall) {

    //category functions
    this.getCategories = function(){
        return $q(function (resolve, reject) {
            dbCall.getAllData("categories").then(function(result) {
                resolve(result)
            })
        })
    };

    this.getCategoryById = function(id) {
        return $q(function (resolve, reject) {
            dbCall.getIndividualData("categories", parseInt(id)).then(function(result) {
                resolve([result])
            })
        })
    };

    this.updateCategoryById = function(category){
        return $q(function (resolve, reject) {
            dbCall.update("categories", category.category_id, [["category_name", category.category_name], ["category_colour", category.category_colour]]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.addCategory  = function(category){
        return $q(function (resolve, reject) {
            dbCall.add("categories", category).then(function(result) {
                resolve(result)
            })
        })
    };

    this.deleteCategoryById = function(id){
        return $q(function (resolve, reject) {
            dbCall.update("notes", id, [["categories_id", '']], "categories_id").then(function(result) {
                dbCall.remove("categories", id).then(function (result) {
                    resolve(result)
                })
            })
        })
    };

    //notes functions
    this.getNotes = function(catID){
        var baseSQL;
        var baseParams = [];
        return $q(function (resolve, reject) {
            if (catID === "99999") {
                dbCall.getJoinedData(["notes", "categories", "status"], 0, "categories_id", [{pri_table: 'notes', pri_col: 'categories_id', other_table: 'categories', other_col: 'category_id'}, {pri_table: 'notes', pri_col: 'status_id', other_table: 'status', other_col: 'status_id'}]).then(function(result){
                    resolve(result)
                });
            } else {
                dbCall.getJoinedData(["notes", "categories", "status"], parseInt(catID), "categories_id", [{pri_table: 'notes', pri_col: 'categories_id', other_table: 'categories', other_col: 'category_id'}, {pri_table: 'notes', pri_col: 'status_id', other_table: 'status', other_col: 'status_id'}]).then(function(result){
                    resolve(result)
                });
            }
        })
    };

    this.getNoteById = function(id) {
        return $q(function (resolve, reject) {
            dbCall.getJoinedData(["notes", "categories", "status"], parseInt(id), "note_id", [{pri_table: 'notes', pri_col: 'categories_id', other_table: 'categories', other_col: 'category_id'}, {pri_table: 'notes', pri_col: 'status_id', other_table: 'status', other_col: 'status_id'}]).then(function(result){
                resolve(result)
            })
        })
    };

    this.completeNote = function(id, completed) {
        return $q(function (resolve, reject) {
            dbCall.update("notes", id, [["complete", completed]]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.starNote = function(id, starred){
        return $q(function (resolve, reject) {
            dbCall.update("notes", id, [["starred", starred]]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.statusUpdateNote = function(id, status){
        return $q(function (resolve, reject) {
            dbCall.update("notes", id, [["status_id", status]]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.updateNoteById = function(note){
        return $q(function (resolve, reject) {
            dbCall.update("notes", note.note_id, [["title", note.title], ["notes", note.notes], ["date_due", note.date_due], ["categories_id", note.categories_id], ["photo", note.photo]]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.addNewNote = function(note){
        return $q(function (resolve, reject) {
            dbCall.add("notes", note).then(function(result) {
                resolve(result)
            })
        })
    };

    this.getStatuses = function(){
        return $q(function (resolve, reject) {
            dbCall.getAllData("status").then(function(result) {
                resolve(result)
            })
        })
    };

    this.loadSettings = function(){
        return $q(function (resolve, reject) {
            dbCall.getAllData("settings").then(function(result) {
                resolve(result)
            })
        })
    };

    this.saveSettings = function(data){
        return $q(function (resolve, reject) {
            dbCall.update("settings", 1, [["add_to_calendar_default", data.add_to_calendar_default], ["allow_notifications", data.allow_notifications],["allow_calendar_integration", data.allow_calendar_integration]]).then(function(result) {
                resolve(result)
            })
        })
    };
});