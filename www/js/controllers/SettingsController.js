app.controller('SettingsController', function($scope, $rootScope, NoteService, $timeout, speech) {
    $scope.saveText = "Save"
    NoteService.loadSettings().then(function(result){
        $scope.localSettings = result
        console.log($scope.localSettings)
        $scope.sortOrders = [
            {code: 'date_added_numeric', text: 'Date Added', asc: 'Newest First', desc: 'Oldest First'},
            {code: 'date_due_numeric', text: 'Date Due', asc: 'Most Urgent First', desc: 'Least Urgent First'}, 
            {code: 'starred', text: 'Priority', asc: 'Highest Priority First', desc: 'Lowest Priority First'},
            {code: 'status_id', text: 'Status', asc: 'Highest Status First', desc: 'Lowest Status First'}
        ]
    })
    
    $scope.changeSettings = function(reloadPage){
        NoteService.saveSettings($scope.localSettings).then(function(){
            $scope.saveText = "Settings Saved";
            $timeout(function() {
                $scope.saveText = "Save";
            }, 2000)
            $rootScope.$broadcast("SettingsLoaded")
            $rootScope.notedSettings = $scope.localSettings
            $rootScope.orderByWhat = $scope.localSettings.sort_order
            $rootScope.reverse = $scope.localSettings.sort_order_reverse
        });
    };

    $scope.changeSort = function(type) {
        if (type.code === $scope.localSettings.sort_order) {
            $scope.localSettings.sort_order_reverse = !$scope.localSettings.sort_order_reverse
        }
        $scope.localSettings.sort_order = type.code
    };
});