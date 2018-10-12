app.service('NoteService', function (dbCall, $rootScope, $q, checkDates) {
    //function to load notes
    var aStatuses = []
    dbCall.getData("select * from status", []).then(function(data){
        aStatuses = data
    })

    this.loadNotes = function(id) {
        //if not ID passed, then load all the notes

        return $q(function (resolve, reject) {
            var baseSQL;
            var baseParams = [];
            if(!id) {
                baseSQL = "Select * FROM notes left join categories c on notes.categories_id=c.category_id left join status s on notes.status_id=s.status_id";
                //if (!$rootScope.showAllItemsInDisplay) baseSQL += " where complete=0";
                baseSQL += " order by date_added DESC, title";
            } else {
                baseSQL = "Select * FROM notes left join categories c on notes.categories_id=c.category_id left join status s on notes.status_id=s.status_id where note_id=?"
                baseParams = [id]
            }

            dbCall.getData(baseSQL, baseParams).then(function(result) {
                result.forEach(function(note) {
                    ammendNoteObj(note)
                });
                resolve(result)
            })
        });

    };

    this.loadPriorityNotes = function(){
        return $q(function (resolve, reject) {
            //get all the data which has a date_due set and is currently not complete
            var importantNotes = [];
            dbCall.getData("Select * FROM notes left join categories c on notes.categories_id=c.category_id left join status s on notes.status_id=s.status_id where complete=0 and NOT date_due = ''").then(function (result) {
                //get the overdue ones first
                result.forEach(function (note) {
                    if (checkDates.checkOverDue(note.date_due) === "noteOverdue") {
                        ammendNoteObj(note);
                        importantNotes.push(note)
                    }
                });

                //get the ones due today
                result.forEach(function (note) {
                    if (checkDates.checkOverDue(note.date_due) === "noteDueToday") {
                        ammendNoteObj(note);
                        importantNotes.push(note)
                    }
                });

                //get the ones due tomorrow
                result.forEach(function (note) {
                    if (checkDates.checkOverDue(note.date_due) === "noteDueTomorrow") {
                        ammendNoteObj(note);
                        importantNotes.push(note)
                    }
                });
                resolve(importantNotes)
            })
        })
    };

    this.deleteNote = function(id, complete){
        return $q(function (resolve, reject) {
            dbCall.modifyData("update notes set complete=? where note_id=?", [complete, id]).then(function(result) {
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

    //function to toggle through the statuses an item can have
    this.changeStatus = function(id, newStatus){
        return $q(function (resolve, reject) {
            dbCall.modifyData("update notes set status_id=? where note_id=?", [newStatus, id]).then(function (result) {
                resolve(result)
            })
        })
    };

    //add/edit a note
    this.addNote = function(id, note){
        return $q(function (resolve, reject) {
            if (note.date_due === undefined) note.date_due = "";

            //set a notification
            cordova.plugins.notification.local.schedule({
                id: id,
                title: note.title,
                text: note.notes,
                trigger: { at: note.date_due }
            });

            if (id) {
                //update an existing item
                dbCall.modifyData("update notes set title = ?, notes = ?, date_due = ?, categories_id =?, photo = ? where note_id=?", [note.title, note.notes, note.date_due, note.categories_id, note.photo, id]).then(function (result) {
                    resolve(result)
                })
            } else {
                //new item to add to the database
                note.photo = (note.photo === "img/blank_img.png") ? "" : note.photo
                dbCall.modifyData("insert into notes (title, notes, date_due, categories_id, photo) values (?,?,?,?,?)", [note.title, note.notes, note.date_due, note.categories_id, note.photo]).then(function (result) {
                    resolve(result)
                })
            }
        })
    };

    this.loadCategories = function(id) {
        return $q(function (resolve, reject) {
            dbCall.getData("Select * FROM categories").then(function(result) {
                resolve(result)
            })
        });
    };


    this.NewNoteObject = function(title, notes, date_due, categories_id, photo) {
        this.title = title;
        this.notes = notes;
        this.date_due = date_due;
        this.categories_id = categories_id;
        this.photo = photo;
    };

    this.ammendNoteObj = function(note){
        ammendNoteObj(note)
    }


    //set classes, images etc. for each note
    function ammendNoteObj(note) {
        note.class = checkDates.checkOverDue(note.date_due);
        note.actionImage = (note.complete == 0) ? "img/delete.png" : "img/add.png";
        note.starredImage = (note.starred == 0) ? "img/empty_star.png" : "img/full_star.png";
        var oStatus = aStatuses.filter(function (status){
            return status.status_id === note.status_id
        })
        note.status_name = oStatus[0].status_name
        note.class_name = oStatus[0].class_name
        note.date_added_numeric = new Date(note.date_added).getTime()
        if (note.date_due){
            note.date_due_numeric = new Date(note.date_due).getTime()
        } else {
            note.date_added_numeric = ""
        }
    }
});


