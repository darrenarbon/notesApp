app.service('NotesDAO', function ($q, dbCall) {

    //category functions
    this.getCategories = function(){
        return $q(function (resolve, reject) {
            dbCall.getData("Select * FROM categories", []).then(function(result) {
                resolve(result)
            })
        })
    };

    this.getCategoryById = function(id) {
        return $q(function (resolve, reject) {
            dbCall.getData("Select * FROM categories where category_id = ?", [parseInt(id)]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.updateCategoryById = function(category){
        return $q(function (resolve, reject) {
            dbCall.modifyData("update categories set category_name = ?, category_colour = ? where category_id=?", [category.category_name, category.category_colour, category.category_id]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.addCategory  = function(category){
        return $q(function (resolve, reject) {
            dbCall.modifyData("insert into categories (category_name, category_colour) values (?,?)", [category.category_name, category.category_colour]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.deleteCategoryById = function(id){
        return $q(function (resolve, reject) {
            dbCall.modifyData("update notes set categories_id='-1' where categories_id=?", [parseInt(id)]).then(function(result) {
                dbCall.modifyData("delete from categories where category_id=?", [parseInt(id)]).then(function (result) {
                    resolve(result)
                })
            })
        })
    };

    //notes functions
    this.getNotes = function(catID){
        var baseSQL;
        var baseParams = [];
        if (catID === "99999") {
            baseSQL = "Select * from notes left join categories c on notes.categories_id=c.category_id left join status s on notes.status_id=s.status_id where (notes.categories_id = '') OR (notes.categories_id IS NULL) OR (notes.categories_id =0) OR (notes.categories_id =-1)";
        } else if (catID === "all") {
            baseSQL = "Select * from notes left join categories c on notes.categories_id=c.category_id left join status s on notes.status_id=s.status_id where notes.complete = 0";
        } else {
            baseSQL = "Select * from notes left join categories c on notes.categories_id=c.category_id left join status s on notes.status_id=s.status_id where notes.categories_id = ?";
            baseParams = [parseInt(catID)]
        }
        return $q(function (resolve, reject) {
            dbCall.getData(baseSQL, baseParams).then(function(result) {
                resolve(result)
            })
        })
    };

    this.getNoteById = function(id) {
        return $q(function (resolve, reject) {
            dbCall.getData("Select * FROM notes left join categories c on notes.categories_id=c.category_id left join status s on notes.status_id=s.status_id where note_id=?", [parseInt(id)]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.completeNote = function(id, completed) {
        return $q(function (resolve, reject) {
            dbCall.modifyData("update notes set complete=? where note_id=?", [completed, parseInt(id)]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.starNote = function(id, starred){
        return $q(function (resolve, reject) {
            dbCall.modifyData("update notes set starred=? where note_id=?", [starred, parseInt(id)]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.statusUpdateNote = function(id, status){
        return $q(function (resolve, reject) {
            dbCall.modifyData("update notes set status_id=? where note_id=?", [status, parseInt(id)]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.updateNoteById = function(note){
        return $q(function (resolve, reject) {
            dbCall.modifyData("update notes set title = ?, notes = ?, date_due = ?, categories_id =?, photo = ?, add_to_calendar=?, calendar_id=? where note_id=?", [note.title, note.notes, note.date_due, note.categories_id, note.photo, note.add_to_calendar, note.calendar_id, note.note_id]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.addNewNote = function(note){
        return $q(function (resolve, reject) {
            dbCall.modifyData("insert into notes (title, notes, date_due, categories_id, photo, add_to_calendar, calendar_id) values (?,?,?,?,?,?,?)", [note.title, note.notes, note.date_due, note.categories_id, note.photo, note.add_to_calendar, note.calendar_id]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.getStatuses = function(){
        return $q(function (resolve, reject) {
            dbCall.getData("select * from status", []).then(function(result) {
                resolve(result)
            })
        })
    };

    this.loadSettings = function(){
        return $q(function (resolve, reject) {
            dbCall.getData("select * from noted_settings", []).then(function(result) {
                resolve(result)
            })
        })
    };

    this.saveSettings = function(data){
        return $q(function (resolve, reject) {
            dbCall.modifyData("update noted_settings set add_to_calendar_default = ?, allow_notifications = ?, allow_calendar_integration = ? where settings_id=?", [data.add_to_calendar_default, data.allow_notifications, data.allow_calendar_integration, 1]).then(function(result) {
                resolve(result)
            })
        })
    };
});