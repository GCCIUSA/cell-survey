var app = angular.module("app", ["ngSanitize", "ui.router"]);

app.run(["$rootScope",
    ($rootScope) => {
        // global directives
        $rootScope.gcciMessage = { "toggle": false };
    }
]);