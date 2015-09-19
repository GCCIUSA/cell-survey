var app = angular.module("app", ["ngSanitize", "ui.router"]);

app.run(["$rootScope",
    function ($rootScope) {
        // global directives
        $rootScope.gcciMessage = { "toggle": false };
    }
]);