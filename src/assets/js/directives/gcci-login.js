app.directive("gcciLogin", function () {
    return {
        "restrict": "E",
        "scope": { "loginToggle": "=", "loginCallback": "&" },
        "templateUrl": "gcci-login.html",
        "link": function (scope, elem) {
            var modal = elem.find("> div.modal");

            modal.on("hidden.bs.modal", function () {
                scope.$apply(function () {
                    scope.loginToggle = false;
                    scope.loginCallback();
                });
            });

            scope.$watch("loginToggle", function (newVal) {
                modal.modal(newVal ? "show" : "hide");
            });
        }
    };
});