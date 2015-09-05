var app = angular.module("app", ["ngSanitize"]);

app.run(["$rootScope",
    function ($rootScope) {
        // global directives
        $rootScope.gcciMessage = { "toggle": false };
    }
]);