app.directive("gcciLogin", () => {
    return {
        "restrict": "E",
        "scope": { "loginToggle": "=", "loginCallback": "&" },
        "templateUrl": "gcci-login.html",
        "link": (scope, elem) => {
            let modal = elem.find("> div.modal");

            modal.on("hidden.bs.modal", () => {
                scope.$apply(() => {
                    scope.loginToggle = false;
                    scope.loginCallback();
                });
            });

            scope.$watch("loginToggle", (newVal) => {
                if (newVal) modal.modal("show");
            });
        }
    };
});