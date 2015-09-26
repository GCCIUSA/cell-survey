export function gcciMessage() {
    return {
        "restrict": "E",
        "scope": { "messageToggle": "=", "messageType": "@", "messageCallback": "&", "messageTitle": "@", "messageBody": "@" },
        "templateUrl": "gcci-message.html",
        "link": (scope, elem) => {
            let modal = elem.find("> div.modal");

            modal.on("hidden.bs.modal", () => {
                scope.$apply(() => {
                    scope.messageToggle = false;
                    scope.messageCallback();
                });
            });

            scope.$watch("messageToggle", (newVal) => {
                if (newVal) modal.modal("show");
            });
        }
    };
}