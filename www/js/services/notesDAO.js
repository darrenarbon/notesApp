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
            dbCall.getData("Select * FROM categories where category_id = ?", [id]).then(function(result) {
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
            dbCall.modifyData("update notes set categories_id='' where categories_id=?", [id]).then(function(result) {
                dbCall.modifyData("delete from categories where category_id=?", [id]).then(function (result) {
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
            baseSQL = "Select * from notes left join categories c on notes.categories_id=c.category_id left join status s on notes.status_id=s.status_id where (notes.categories_id = '') OR (notes.categories_id IS NULL)";
        } else {
            baseSQL = "Select * from notes left join categories c on notes.categories_id=c.category_id left join status s on notes.status_id=s.status_id where notes.categories_id = ?";
            baseParams = [catID]
        }
        return $q(function (resolve, reject) {
            dbCall.getData(baseSQL, baseParams).then(function(result) {
                resolve(result)
            })
        })
    };

    this.getNoteById = function(id) {
        return $q(function (resolve, reject) {
            dbCall.getData("Select * FROM notes left join categories c on notes.categories_id=c.category_id left join status s on notes.status_id=s.status_id where note_id=?", [id]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.completeNote = function(id, completed) {
        return $q(function (resolve, reject) {
            dbCall.modifyData("update notes set complete=? where note_id=?", [completed, id]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.starNote = function(id, starred){
        return $q(function (resolve, reject) {
            dbCall.modifyData("update notes set starred=? where note_id=?", [starred, id]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.statusUpdateNote = function(id, status){
        return $q(function (resolve, reject) {
            dbCall.modifyData("update notes set status_id=? where note_id=?", [status, id]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.updateNoteById = function(note){
        return $q(function (resolve, reject) {
            dbCall.modifyData("update notes set title = ?, notes = ?, date_due = ?, categories_id =?, photo = ? where note_id=?", [note.title, note.notes, note.date_due, note.categories_id, note.photo, note.note_id]).then(function(result) {
                resolve(result)
            })
        })
    };

    this.addNewNote = function(note){
        return $q(function (resolve, reject) {
            dbCall.modifyData("insert into notes (title, notes, date_due, categories_id, photo) values (?,?,?,?,?)", [note.title, note.notes, note.date_due, note.categories_id, note.photo]).then(function(result) {
                resolve(result)
            })
        })
    };
});