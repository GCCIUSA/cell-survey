app.directive("gcciMessage", function () {
    return {
        "restrict": "E",
        "scope": { "messageToggle": "=", "messageType": "@", "messageCallback": "&", "messageTitle": "@", "messageBody": "@" },
        "templateUrl": "gcci-message.html",
        "link": function (scope, elem) {
            var modal = elem.find("> div.modal");

            modal.on("hidden.bs.modal", function () {
                scope.$apply(function () {
                    scope.messageToggle = false;
                    scope.messageCallback();
                });
            });

            scope.$watch("messageToggle", function (newVal) {
                modal.modal(newVal ? "show" : "hide");
            });
        }
    };
});