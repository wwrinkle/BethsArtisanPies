var app = angular.module('AdminApp', ['ngRoute', 'ngFileUpload']);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/admin-home.html',
            controller: 'AdminHomeController'
        })
        .when('/home-carousel', {
            templateUrl: 'views/home-carousel.html',
            controller: 'HomeCarouselController'
        })
        .when('/the-pie-shop', {
            templateUrl: 'views/the-pie-shop.html',
            controller: 'ThePieShopController'
        })
        .when('/about-beth', {
            templateUrl: 'views/about-beth.html',
            controller: 'AboutBethController'
        })
        .when('/the-pies', {
            templateUrl: 'views/the-pies.html',
            controller: 'ThePiesController'
        })
        .when('/sweet-pies', {
            templateUrl: 'views/sweet-pies.html',
            controller: 'SweetPiesController'
        })
        .when('/special-orders', {
            templateUrl: 'views/special-orders.html',
            controller: 'SpecialOrdersController'
        })
        .when('/savory-pies', {
            templateUrl: 'views/savory-pies.html',
            controller: 'SavoryPiesController'
        })
        .when('/lunch-menu', {
            templateUrl: 'views/lunch-menu.html',
            controller: 'LunchMenuController'
        })
        .when('/brunch-menu', {
            templateUrl: 'views/brunch-menu.html',
            controller: 'BrunchMenuController'
        })
        .when('/sides-menu', {
            templateUrl: 'views/sides-menu.html',
            controller: 'SidesMenuController'
        })
        .when('/order-online', {
            templateUrl: 'views/order-online.html',
            controller: 'OrderOnlineController'
        })
        .when('/contact', {
            templateUrl: 'views/contact.html',
            controller: 'ContactController'
        })
        .otherwise({
            redirectTo: '/'
        });
    $locationProvider.html5Mode(true);
});

app.run(function($rootScope, $http, ArrayService) {
    $rootScope.siteData = {};
    $rootScope.unformattedParagraphs = {
        thePieShop: '',
        aboutBeth: '',
        thePies: '',
        orderOnline: ''
    };
    $rootScope.unformattedContact = {
        address: '',
        hours: ''
    };
    $rootScope.textUnformatter = function(formattedArray, spacer) {
        var unformattedString = '';
        for (var i = 0; i < formattedArray.length; i++) {
            unformattedString += formattedArray[i] + spacer;
        }
        return unformattedString;
    };
    $http.get('./data/site-data.json')
        .then(function(response) {
            $rootScope.siteData = response.data;
            for (var key in $rootScope.siteData.text) {
                $rootScope.unformattedParagraphs[key] = $rootScope.textUnformatter($rootScope.siteData.text[key].paragraphs, '\n\n');
            }
            $rootScope.unformattedContact.address = $rootScope.textUnformatter($rootScope.siteData.contact.address, '\n');
            $rootScope.unformattedContact.hours = $rootScope.textUnformatter($rootScope.siteData.contact.hours, '\n');
            console.log($rootScope.siteData);
        }, function(error) {
            console.error(error);
        });
    $rootScope.changeArray = function(verb, array, index) {
        ArrayService.changeArray(verb, array, index);
    };
});

app.service('ImageUpload', function(Upload) {
    this.upload = function(file, successCallback, errorCallback, progressCallback) {
        if (file.name && file.size) {
            Upload.upload({
                url: './assets/image-upload.php',
                method: 'POST',
                file: file
            }).then(function(result) {
                successCallback(file.name);
            }, function(error) {
                errorCallback();
                console.error(error);
            }, function(event) {
                var progress = Math.min(100, parseInt(100 * (event.loaded / event.total)));
                if (progress == 100) {
                    progress = '';
                } else {
                    progress += '%';
                }
                progressCallback(progress);
            });
        }
    }
});

app.service('ArrayService', function() {
    this.changeArray = function(verb, array, index) {
        switch (verb) {
            case 'delete':
                array.splice(index, 1);
            case 'move up':
                if (index > 0) {
                    var removedElement = array.slice(index, index + 1);
                    array.splice(index, 1);
                    array.splice(index - 1, 0, removedElement[0]);
                }
            case 'move down':
                if (index < array.length) {
                    var removedElement = array.slice(index, index + 1);
                    array.splice(index, 1);
                    array.splice(index + 1, 0, removedElement[0]);
                }
        }
        for (var i = 0; i < array.length; i++) {
            if (array[i] == undefined) {
                array.splice(i, 1);
            }
        }
    }
});

app.controller('SaveController', function($scope, $rootScope, $http) {
    var cleanArray = function(array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == undefined || array[i] == '') {
                array.splice(i, 1);
            }
        }
        return array;
    };
    $scope.save = function() {
        for (var key in $rootScope.unformattedParagraphs) {
            $rootScope.siteData.text[key].paragraphs = cleanArray($rootScope.unformattedParagraphs[key].split('\n\n'));
            $rootScope.unformattedParagraphs[key] = $rootScope.textUnformatter($rootScope.siteData.text[key].paragraphs, '\n\n');

        }
        for (var key in $rootScope.unformattedContact) {
            $rootScope.siteData.contact[key] = cleanArray($rootScope.unformattedContact[key].split('\n'));
            $rootScope.unformattedContact[key] = $rootScope.textUnformatter($rootScope.siteData.contact[key], '\n');
        }
        $scope.message = {};
        $http.post('./assets/json-post.php', $rootScope.siteData)
            .then(function(response) {
                console.log(response);
                $scope.message.text = 'Content Saved.';
                $scope.message.isError = false;
            }, function(error) {
                console.error(error);
                $scope.message.text = 'Something went wrong. Please try again.';
                $scope.message.isError = true;
            });
        console.log($rootScope.siteData);
    };
});

app.controller('AdminHomeController', function($rootScope) {});

app.controller('HomeCarouselController', function($scope, $rootScope, ImageUpload) {
    $scope.message = {};
    $scope.progress = '';
    $scope.uploadImage = function() {
        ImageUpload.upload($scope.imageToUpload, function(name) {
            $scope.imageToUpload = '';
            $scope.message.text = 'Image uploaded successfully.';
            var newImage = {
                image: name
            };
            $rootScope.siteData.galleries.homeCarousel.push(newImage);
        }, function() {
            $scope.message.text = 'Something went wrong.';
            $scope.message.isError = true;
        }, function(progress) {
            $scope.progress = progress;
        });
    };
});

app.controller('ThePieShopController', function($rootScope) {});

app.controller('AboutBethController', function($scope, $rootScope, ImageUpload) {
    $scope.message = {};
    $scope.progress = '';
    $scope.uploadImage = function() {
        ImageUpload.upload($scope.imageToUpload, function(name) {
            $scope.imageToUpload = '';
            $scope.message.text = 'Image uploaded successfully.';
            $rootScope.siteData.text.aboutBeth.image = name;
        }, function() {
            $scope.message.text = 'Something went wrong.';
            $scope.message.isError = true;
        }, function(progress) {
            $scope.progress = progress;
        });
    };
});

app.controller('ThePiesController', function($rootScope) {});

app.controller('SweetPiesController', function($scope, $rootScope, ImageUpload) {
    $scope.message = {};
    $scope.progress = '';
    $scope.newPie = {};
    $scope.uploadPie = function() {
        console.log($scope.newPie);
        ImageUpload.upload($scope.imageToUpload, function(name) {
            $scope.message.text = 'Image uploaded successfully.';
            $scope.newPie.image = name;
            $rootScope.siteData.galleries.sweetPies.push($scope.newPie);
            $scope.newPie = {};
            $scope.imageToUpload = '';
        }, function() {
            $scope.message.text = 'Something went wrong.';
            $scope.message.isError = true;
        }, function(progress) {
            $scope.progress = progress;
        });
    };
});

app.controller('SpecialOrdersController', function($scope, $rootScope, ImageUpload) {
    var clearNewMenuItem = function() {
        $scope.newMenuItem = {
            title: '',
            description: '',
            price: ''
        };
    };
    clearNewMenuItem();
    $scope.newMenuItem = {};
    $scope.addMenuItem = function() {
        $rootScope.siteData.menu.specialOrders.push($scope.newMenuItem);
        clearNewMenuItem();
    };
});

app.controller('SavoryPiesController', function($scope, $rootScope, ImageUpload) {
    $scope.message = {};
    $scope.progress = '';
    $scope.newPie = {};
    $scope.uploadPie = function() {
        console.log($scope.newPie);
        ImageUpload.upload($scope.imageToUpload, function(name) {
            $scope.message.text = 'Image uploaded successfully.';
            $scope.newPie.image = name;
            $rootScope.siteData.galleries.savoryPies.push($scope.newPie);
            $scope.newPie = {};
            $scope.imageToUpload = '';
        }, function() {
            $scope.message.text = 'Something went wrong.';
            $scope.message.isError = true;
        }, function(progress) {
            $scope.progress = progress;
        });
    };
});

app.controller('LunchMenuController', function($scope, $rootScope) {
    var clearNewMenuItem = function() {
        $scope.newMenuItem = {
            title: '',
            description: '',
            price: ''
        };
    };
    clearNewMenuItem();
    $scope.newMenuItem = {};
    $scope.addMenuItem = function() {
        $rootScope.siteData.menu.lunch.push($scope.newMenuItem);
        clearNewMenuItem();
    };
});

app.controller('BrunchMenuController', function($scope, $rootScope) {
    var clearNewMenuItem = function() {
        $scope.newMenuItem = {
            title: '',
            description: '',
            price: ''
        };
    };
    clearNewMenuItem();
    $scope.newMenuItem = {};
    $scope.addMenuItem = function() {
        $rootScope.siteData.menu.brunch.push($scope.newMenuItem);
        clearNewMenuItem();
    };
});
app.controller('SidesMenuController', function($scope, $rootScope) {
    var clearNewMenuItem = function() {
        $scope.newMenuItem = {
            title: '',
            description: '',
            price: ''
        };
    };
    clearNewMenuItem();
    $scope.newMenuItem = {};
    $scope.addMenuItem = function() {
        $rootScope.siteData.menu.sides.push($scope.newMenuItem);
        clearNewMenuItem();
    };
});

app.controller('OrderOnlineController', function($rootScope) {});

app.controller('ContactController', function($rootScope) {});