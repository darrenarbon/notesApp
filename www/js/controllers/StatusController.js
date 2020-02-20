app.controller('StatusController', function($scope, $timeout, NoteService) {
    $scope.loading = true;
    $scope.$on('$viewContentLoaded', function() {
        NoteService.loadStatuses().then(function(data){
            $scope.statuses = data;
            console.log(data)
            NoteService.loadPriorities().then(data => {
                $scope.priorities = data
                console.log(data)
                $timeout(function() {
                    $scope.loading = false;
                },0);
            })
        });
        
    });
});