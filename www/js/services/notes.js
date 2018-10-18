app.service('NoteService', function (dbCall, $rootScope, $q, checkDates, NotesDAO) {
    //function to load notes
    var aStatuses = [];

    function addDynamicCategories(catList, fullList) {
        catList.forEach(function (cat) {
            cat.href = "#!/categories/" + cat.category_id + "/notes"
        });
        if (fullList) {
            catList.unshift({
                category_id: 0,
                category_name: "Priority List",
                category_colour: "#FF0000",
                href: "#!/categories/0/notes",
                noDelete: true
            });
            catList.push({
                category_id: 99999,
                category_name: "Uncategorised",
                category_colour: "cornflowerblue",
                href: "#!/categories/99999/notes",
                noDelete: true
            });
        }
        return catList
    }

    function getStats(category){
        NotesDAO.getNotes(category.category_id).then(function(result){
            var aActiveNotes = result.filter(function(note){
                return note.complete === 0
            });
            var aOverdueNotes = result.filter(function(note){
                return (checkDates.checkOverDue(note.date_due) === "noteOverdue" && note.complete ===0);
            });
            category.number_active_notes = aActiveNotes.length;
            category.number_overdue_notes = aOverdueNotes.length;
        })
    }

    dbCall.getData("select * from status", []).then(function(data){
        aStatuses = data
    });

    this.loadNotes = function(catID, noteID) {
        //if not ID passed, then load all the notes

        return $q(function (resolve, reject) {
            if(catID) {
                NotesDAO.getNotes(catID).then(function(result){
                    result.forEach(function(note) {
                        ammendNoteObj(note)
                    });
                    resolve(result)
                });
            } else if (noteID) {
                NotesDAO.getNoteById(noteID).then(function(result){
                    result.forEach(function(note) {
                        ammendNoteObj(note)
                    });
                    resolve(result)
                });
            }
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
            NotesDAO.completeNote(id, complete).then(function(result) {
                resolve(result)
            })
        })
    };

    this.starNote = function(id, starred){
        return $q(function (resolve, reject) {
            NotesDAO.starNote(id, starred).then(function(result) {
                resolve(result)
            })
        })
    };

    //function to toggle through the statuses an item can have
    this.changeStatus = function(id, newStatus){
        return $q(function (resolve, reject) {
            NotesDAO.statusUpdateNote(id, newStatus).then(function (result) {
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
                NotesDAO.updateNoteById(note).then(function (result) {
                    resolve(result)
                })
            } else {
                //new item to add to the database
                note.photo = (note.photo === "img/blank_img.png") ? "" : note.photo
                NotesDAO.addNewNote(note).then(function (result) {
                    resolve(result)
                })
            }
        })
    };

    this.loadCategories = function(catId, fullList) {
        //catId loads a specific category, fullList adds the priority and uncategorised to the list.
        return $q(function (resolve, reject) {
            if(catId) {
                NotesDAO.getCategoryById(catId).then(function(data){
                    resolve(addDynamicCategories(data, fullList))
                })
            } else {
                NotesDAO.getCategories().then(function(data){
                    data.forEach(function(category){
                        getStats(category);
                    });
                    console.log(data)
                    resolve(addDynamicCategories(data, fullList))
                })
            }
        })
    };

    this.addCategory = function(catId, category) {
        return $q(function (resolve, reject) {
            if (catId) {
                //update an existing item
                NotesDAO.updateCategoryById(category).then(function (result) {
                    resolve(result)
                })
            } else {
                //new item to add to the database
                NotesDAO.addCategory(category).then(function (result) {
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
                    NotesDAO.deleteCategoryById(category.category_id).then(function (result) {
                        resolve(result)
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
    };


    //set classes, images etc. for each note
    function ammendNoteObj(note) {
        note.class = checkDates.checkOverDue(note.date_due);
        note.actionImage = (note.complete == 0) ? "img/delete.png" : "img/add.png";
        note.starredImage = (note.starred == 0) ? "img/empty_star.png" : "img/full_star.png";
        var oStatus = aStatuses.filter(function (status){
            return status.status_id === note.status_id
        });
        note.status_name = oStatus[0].status_name;
        note.class_name = oStatus[0].class_name;
        note.date_added_numeric = new Date(note.date_added).getTime();
        if (note.date_due){
            note.date_due_numeric = new Date(note.date_due).getTime()
        } else {
            note.date_added_numeric = ""
        }
        if (note.categories_id == null) note.categories_id = "99999"
    }
});