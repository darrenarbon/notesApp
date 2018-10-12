app.service('speech', function ($q,NoteService) {
    this.getNote = function() {
        return $q(function (resolve, reject) {
            window.speechRecognition.isRecognitionAvailable().then(function (available) {
                if (available) {
                    return window.speechRecognition.hasPermission();
                }
            }).then(function (hasPermission) {

                function startRecognition() {
                    return window.speechRecognition.startRecognition({
                        language: "en-US",
                        showPopup: true
                    }).then(function (data) {
                        resolve(window.speechRecognition.packageNote(data[0]))
                    }).catch(function (err) {
                        console.error(err);
                    });
                }


                if (!hasPermission) {
                    window.speechRecognition.requestPermission().then(function () {
                        startRecognition();
                    }).catch(function (err) {
                        console.error("Cannot get permission", err);
                    });
                } else {
                    startRecognition();
                }
            }).catch(function (err) {
                console.error(err);
            });
        })
    };

    window["speechRecognition"] = {
        hasPermission: function(){
            return new Promise(function(resolve, reject){
                window.plugins.speechRecognition.hasPermission(function (isGranted){
                    resolve(isGranted);
                }, function(err){
                    reject(err);
                });
            });
        },
        requestPermission: function(){
            return new Promise(function(resolve, reject){
                window.plugins.speechRecognition.requestPermission(function (){
                    resolve();
                }, function (err){
                    reject();
                });
            });
        },
        startRecognition: function(settings){
            return new Promise(function(resolve, reject){
                window.plugins.speechRecognition.startListening(function(result){
                    resolve(result);
                }, function(err){
                    reject(err);
                }, settings);
            });
        },
        getSupportedLanguages: function(){
            return new Promise(function(resolve, reject){
                window.plugins.speechRecognition.getSupportedLanguages(function(result){
                    resolve(result);
                }, function(err){
                    reject(err);
                });
            });
        },
        isRecognitionAvailable: function(){
            return new Promise(function(resolve, reject){
                window.plugins.speechRecognition.isRecognitionAvailable(function(available){
                    resolve(available);
                }, function(err){
                    reject(err);
                });
            });
        },
        stopListening: function(){
            return new Promise(function(resolve, reject){
                window.plugins.speechRecognition.stopListening(function(){
                    resolve();
                }, function(err){
                    reject(err);
                });
            });
        },
        packageNote: function(audio){
            var capitalisedText = audio.charAt(0).toUpperCase() + audio.substr(1);
            //find "today" in the audio text
            var todayCounts = capitalisedText.search(/today/i);
            var dateDue
            if (todayCounts > 0) {
                dateDue = new Date()
                capitalisedText = capitalisedText.replace(/today/i, "");
            } else {
                dateDue = ""
            }
            return new NoteService.NewNoteObject(capitalisedText, "", dateDue, "", "");
        }
    };


});