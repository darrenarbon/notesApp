app.service('NoteService', function (dbCall, $rootScope, $q, checkDates, NotesDAO,CalendarService) {
    //function to load notes
    NoteService = this;
    var aStatuses = [];

    //add compatibility so if not on android alerts are still generated
    if (navigator.notification === undefined){
        navigator.notification = {
            confirm : function(text, fnCallBack, buttonText) {
                var response = confirm(text);
                if (response === true){
                    fnCallBack(1)
                }
            },
            prompt : function(text, fnCallBack, title, buttonText){
                var response = prompt(text, title);
                if (response !==null){
                    fnCallBack({buttonIndex: 1, input1: response})
                }
            }
        }
    }

    this.loadSettings = function() {
        return $q(function (resolve, reject) {
            NotesDAO.loadSettings().then(function (result) {
                if (result.length > 0){
                    Object.keys(result[0]).forEach(function(key, index){
                        if (key !== "settings_id"){
                            result[0][key] = (parseInt(result[0][key])) ? true : false
                        }
                    });
                    resolve(result[0])
                } else {
                    resolve({})
                }
            });
        })
    };

    this.saveSettings = function(data){
        return $q(function (resolve, reject) {
            //create a copy of the object to avoid having to reassign values afterwards
            var dataToSend = Object.assign({}, data);
            Object.keys(dataToSend).forEach(function(key, index){
                if (key !== "settings_id"){
                    dataToSend[key] = (dataToSend[key]) ? "1" : "0"
                }
            });
            NotesDAO.saveSettings(dataToSend).then(function (result) {
                resolve(result)
            });
        })
    };

    NotesDAO.getStatuses().then(function(result){
        aStatuses = result
    });

    function addDynamicCategories(catList, fullList, addNew) {
        catList.forEach(function (cat) {
            cat.href = "#!/categories/" + cat.category_id + "/notes"
        });
        if (fullList) {
            if ($rootScope.notedSettings.show_priority_list){
                catList.unshift({
                    category_id: 0,
                    category_name: "Priority List",
                    category_colour: "#FF0000",
                    href: "#!/categories/0/notes",
                    noDelete: true
                });
            }
            catList.push({
                category_id: -1,
                category_name: "Uncategorised",
                category_colour: "cornflowerblue",
                href: "#!/categories/-1/notes",
                noDelete: true
            });
        }
        if(addNew){
            catList.push({
                category_id: -2,
                category_name: "-- Add New --",
                category_colour: "cornflowerblue"
            });
        }
        return catList
    }

    function getStats(category){
        //console.log("NoteService.getStats called: ", category);
        if (category.category_id !== 0) {
            NotesDAO.getNotes(category.category_id).then(function (result) {
                var aActiveNotes = result.filter(function (note) {
                    return note.complete === 0
                });
                var aOverdueNotes = result.filter(function (note) {
                    return (checkDates.checkOverDue(note.date_due) === "noteOverdue" && note.complete === 0);
                });
                category.number_active_notes = aActiveNotes.length;
                category.number_overdue_notes = aOverdueNotes.length;
            })
        } else {
            //we are loading the priority, so need to do special get stats
            NoteService.loadPriorityNotes().then(function(notes){
                category.number_active_notes = notes.length;
                var aOverdueNotes = notes.filter(function (note) {
                    return (checkDates.checkOverDue(note.date_due) === "noteOverdue");
                });
                category.number_overdue_notes = aOverdueNotes.length;
            })
        }
    }

    this.loadNotes = function(catID, noteID) {
        //if not ID passed, then load all the notes
        console.log("called NoteService.loadNotes");
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

    this.searchNotes = function(searchText) {
        return $q(function (resolve, reject) {
            if(searchText) {
                NotesDAO.getNotes("search", searchText).then(function (result) {
                    result.forEach(function (note) {
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

    this.deleteNote = function(note){
        return $q(function (resolve, reject) {
            if ($rootScope.notedSettings.allow_notifications === 1){
                cordova.plugins.notification.local.cancel(note.note_id, function(res){
                    console.log("notification cancel: " + res);
                });
            }
            if(note.calendar_id){
                CalendarService.deleteEvent(note.calendar_id)
            }
            NotesDAO.completeNote(note.note_id, note.complete).then(function(result) {
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
            if (note.categories_id === null) note.categories_id = -1;
            if ($rootScope.notedSettings.allow_notifications === 1){
                //set a notification
                cordova.plugins.notification.local.schedule({
                    id: id,
                    title: note.title,
                    text: note.notes,
                    trigger: { at: note.date_due }
                });
            }

            CalendarService.addEvent(note, $rootScope.notedSettings.allow_calendar_integration).then(function(cal_id){
                if (cal_id !== null) note.calendar_id = cal_id;
                if (id) {
                    //update an existing item
                    NotesDAO.updateNoteById(note).then(function (result) {
                        resolve(result)
                    })
                } else {
                    //new item to add to the database
                    note.photo = (note.photo === "img/blank_img.png") ? "" : note.photo;
                    NotesDAO.addNewNote(note).then(function (result) {
                        resolve(result)
                    })
                }
            })
        })
    };

    this.loadCategories = function(catId, fullList, addNew) {
        //catId loads a specific category, fullList adds the priority and uncategorised to the list.
        //console.log("NoteService.loadCategories called: ", catId, fullList, addNew);
        return $q(function (resolve, reject) {
            if(catId) {
                NotesDAO.getCategoryById(catId).then(function(data){
                    resolve(addDynamicCategories(data, fullList))
                })
            } else {
                NotesDAO.getCategories().then(function(data){
                    data = addDynamicCategories(data, fullList, addNew);
                    data.forEach(function(category){
                        getStats(category);
                    });
                    resolve(data)
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
        this.title              = title;
        this.notes              = notes;
        this.date_due           = date_due;
        this.categories_id      = (categories_id) ? categories_id : -1;
        this.photo              = photo;
        this.date_added         = new Date();
        this.status_id          = 1;
        this.complete           = 0;
        this.starred            = 0;
        this.calendar_id        = '';

        if($rootScope.notedSettings === undefined){
            var newObject = this;
            NoteService.loadSettings().then(function(result){
                $rootScope.notedSettings = result;
                newObject.add_to_calendar    = $rootScope.notedSettings.add_to_calendar_default.toString()
            });
        } else {
            this.add_to_calendar    = $rootScope.notedSettings.add_to_calendar_default.toString()
        }
    };

    this.ammendNoteObj = function(note){
        ammendNoteObj(note)
    };

    //set classes, images etc. for each note
    function ammendNoteObj(note) {
        NotesDAO.getStatuses().then(function(result) {
            note.class = checkDates.checkOverDue(note.date_due);
            note.actionImage = (note.complete == 0) ? "img/delete.png" : "img/add.png";
            note.starredImage = (note.starred == 0) ? "img/empty_star.png" : "img/full_star.png";
            var oStatus = aStatuses.filter(function (status) {
                return status.status_id === note.status_id
            });
            note.status_name = oStatus[0].status_name;
            note.class_name = oStatus[0].class_name;
            note.date_added_numeric = new Date(note.date_added).getTime();
            if (note.date_due) {
                note.date_due_numeric = new Date(note.date_due).getTime()
            } else {
                note.date_added_numeric = ""
            }
            if (note.categories_id == null) note.categories_id = "-1"
        });
    }
});