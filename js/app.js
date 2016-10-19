var app = angular.module('BethsArtisanPiesApp', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap']);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        })
        .when('/dessertpies', {
            templateUrl: 'views/dessertpies.html',
            controller: 'PiesController'
        })
        .when('/savorypies', {
            templateUrl: 'views/savorypies.html',
            controller: 'SavoryPiesController'
        })
        .when('/cafemenu', {
            templateUrl: 'views/cafemenu.html',
            controller: 'MenuController'
        })
        .when('/orderonline', {
            templateUrl: 'views/orderonline.html',
            controller: 'OrderOnlineController'
        })
        .otherwise({
            redirectTo: '/'
        });
    $locationProvider.html5Mode(true);
});

app.run(function($rootScope, $http) {
    $rootScope.siteData = {};
    $http.get('./data/site-data.json')
        .then(function(response) {
            $rootScope.siteData = response.data;
            $rootScope.siteData.contact.unformattedPhone = $rootScope.siteData.contact.phone.replace(/\D/g, '');
        }, function(error) {
            console.error(error);
        });
});

app.directive('slideImage', function() {
    function link(scope, element, attrs) {
        if (window.navigator.userAgent.indexOf('MSIE ') > 0 ||
            window.navigator.userAgent.indexOf('Trident/') > 0 ||
            window.navigator.userAgent.indexOf('Edge/') > 0) {
            element[0].style.width = 'auto';
        }
    }
    return {
        link: link,
        restrict: 'A'
    }
});

app.directive('toTop', function($window) {
    function link(scope, element, attrs) {
        element[0].addEventListener('click', function() {
            document.body.scrollTop = 0;
        });
        angular.element($window).bind('scroll', function() {
            if (document.body.scrollTop == 0) {
                element[0].style.opacity = 0;
            } else {
                element[0].style.opacity = 1;
            }
        });
    }
    return {
        link: link,
        restrict: 'A'
    }
});

app.controller('NavController', function($scope) {
    $scope.isCollapsed = true;
});

app.controller('HomeController', function($rootScope, $swipe) {
    $rootScope.setButton = 0;
});

app.controller('PiesController', function($rootScope) {
    $rootScope.setButton = 1;
});

app.controller('SavoryPiesController', function($rootScope) {
    $rootScope.setButton = 2;
});

app.controller('MenuController', function($rootScope) {
    $rootScope.setButton = 3;
});

app.controller('OrderOnlineController', function($scope, $rootScope, $http, $sce) {
    $rootScope.setButton = 4;

    $scope.orderForm = {};
    $scope.submitMessage = {};
    $scope.submitOrder = function() {
        $http.post('./assets/mail-form.php', $scope.orderForm)
            .then(function(response) {
                $scope.submitMessage.text = 'Form submitted. We will contact you shortly. Thank you.';
                $scope.orderForm = {};
            }, function(error) {
                console.error(error);
                $scope.submitMessage.text = 'Something went wrong. Please try again later.';
                $scope.submitMessage.isError = true;
            })
    };
    
    var embedAddress = '';
    $rootScope.siteData.contact.address.forEach(function(item) {
        embedAddress += item + ' ';
    });
    embedAddress = encodeURIComponent("Beth's Artisan Pies " + embedAddress);
    $scope.mapSrc = $sce.trustAsResourceUrl('https://www.google.com/maps/embed/v1/place?key=AIzaSyCFaQ6uoyl-rpiloTrLm3ZkvITE3qNuh94&q=' + embedAddress);
});