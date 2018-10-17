app.controller('HomeController', function($scope, menuOptions, $rootScope, dbCall, $location) {
    //run the setup
    dbCall.setupData();

    $rootScope.orderByWhat = "date_added_numeric";
    $rootScope.reverse = false;

    //hide the menu
    $scope.showMenu = false;

    //function to toggle menu view
    $scope.showHideMenu = function($event){
        if ($event) {
            $event.stopPropagation();
            $event.preventDefault();
        }
        $scope.showMenu = !$scope.showMenu
    };

    //function to change global variable based on the check box
    $scope.showHideItems = function(){
        $rootScope.showAllItemsInDisplay = $scope.allItems
    };

    $scope.changeSort = function(type, $event) {
        var oMenuDivs = document.querySelectorAll(".menuSubOptionSelected")
        if(oMenuDivs.length > 0){
            oMenuDivs.forEach(function(oDiv){
                oDiv.classList.remove("menuSubOptionSelected", "menuSubOptionAsc", "menuSubOptionDesc")
            })
        }
        if (type === $rootScope.orderByWhat && $rootScope.reverse === false){
            //same option so reverse the order
            $rootScope.reverse = !$rootScope.reverse
            $event.target.classList.add("menuSubOptionDesc", "menuSubOptionSelected")
        } else {
            $rootScope.reverse = false
            $event.target.classList.add("menuSubOptionAsc", "menuSubOptionSelected")
        }
        $rootScope.orderByWhat = type;
        $scope.showHideMenu()
    };
});