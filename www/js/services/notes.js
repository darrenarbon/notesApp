app.service('NoteService', function (dbCall, $rootScope, $q, checkDates) {
    //function to load notes
    var aStatuses = []
    dbCall.getData("select * from status", []).then(function(data){
        aStatuses = data
    })

    this.loadNotes = function(catID, noteID) {
        //if not ID passed, then load all the notes

        return $q(function (resolve, reject) {
            var baseSQL;
            var baseParams = [];
            if(catID) {
                if (catID === "99999") {
                    baseSQL = "Select * from notes left join categories c on notes.categories_id=c.category_id left join status s on notes.status_id=s.status_id where (notes.categories_id = '') OR (notes.categories_id IS NULL)";
                } else {
                    baseSQL = "Select * from notes left join categories c on notes.categories_id=c.category_id left join status s on notes.status_id=s.status_id where notes.categories_id = ?";
                    baseParams = [catID]
                }
            } else if (noteID) {
                baseSQL = "Select * FROM notes left join categories c on notes.categories_id=c.category_id left join status s on notes.status_id=s.status_id where note_id=?";
                baseParams = [noteID]
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
            //cordova.plugins.notification.local.schedule({
            //    id: id,
            //    title: note.title,
            //    text: note.notes,
            //    trigger: { at: note.date_due }
            //});

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

    this.loadCategories = function(catId, fullList) {
        //catId loads a specific category, fullList adds the priority and uncategorised to the list.
        return $q(function (resolve, reject) {
            var baseSQL;

            var baseParams = [];
            if(catId) {
                baseSQL = "Select * from categories where category_id = ?";
                baseParams = [catId]
            } else {
                baseSQL = "Select * FROM categories";
            }

            dbCall.getData(baseSQL, baseParams).then(function(result) {
                result.forEach(function(cat){
                    cat.href = "#!/categories/" + cat.category_id + "/notes"

                });
                if (fullList){
                    result.unshift({
                        category_id: 0,
                        category_name: "Priority List",
                        category_colour: "#FF0000",
                        href: "#!/categories/0/notes",
                        noDelete: true
                    });
                    result.push({
                        category_id: 99999,
                        category_name: "Uncategorised",
                        category_colour: "cornflowerblue",
                        href: "#!/categories/99999/notes",
                        noDelete: true
                    });
                }
                resolve(result)
            })
        })
    };

    this.addCategory = function(catId, category) {
        return $q(function (resolve, reject) {
            if (catId) {
                //update an existing item
                dbCall.modifyData("update categories set category_name = ?, category_colour = ? where category_id=?", [category.category_name, category.category_colour, catId]).then(function (result) {
                    resolve(result)
                })
            } else {
                //new item to add to the database
                dbCall.modifyData("insert into categories (category_name, category_colour) values (?,?)", [category.category_name, category.category_colour]).then(function (result) {
                    resolve(result)
                })
            }
        });
    };

    this.deleteCategory = function(category){
        return $q(function (resolve, reject) {
            navigator.notification.confirm(
                "Are you sure you wish to delete this category, this action cannot be undone. Any notes within this category will be placed in the unassigned list.",
                function(buttonIndex){
                    fnDeleteCat(buttonIndex, category)
                },
                "Delete Category");

            function fnDeleteCat(buttonIndex, category){
                if (buttonIndex === 1){
                    dbCall.modifyData("update notes set categories_id='' where categories_id=?", [category.category_id]).then(function(result) {
                        dbCall.modifyData("delete from categories where category_id=?", [category.category_id]).then(function (result) {
                            resolve(result)
                        })
                    })
                }
            }
        })
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
        if (note.categories_id == null) note.categories_id = "99999"
    }



});


