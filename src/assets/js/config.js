import { router } from './router';
import { API } from './api';
import { ErrorService } from './service';
import { gcciLogin } from './directives/gcci-login';
import { gcciMessage } from './directives/gcci-message';
import { MainCtrl, HomeCtrl } from './controllers/main';
import { SurveyCtrl } from './controllers/survey';
import { ReportCtrl } from './controllers/report';


var app = angular.module("app", ["ngSanitize", "ui.router", "firebase"]);

app.constant("fbUrl", "https://gcci-cell-survey.firebaseio.com");

app.run(["$rootScope",
    ($rootScope) => {
        // global directives
        $rootScope.gcciMessage = class {
            static alert(type, title, body, callback) {
                this.type = type;
                this.title = title;
                this.body = body;
                this.callback = callback;
                this.toggle = true;
            }

            static hide() {
                this.toggle = false;
            }
        };

        // global user data
        $rootScope.user = null;

        // get authentication state
        $rootScope.$on("$stateChangeStart", (evt, toState, toParams) => {
            // add auth check in state's resolve
            if (toState.resolve !== void 0 && !toState.resolve.hasOwnProperty("stateAuth")) {
                toState.resolve.stateAuth = ["api", "$q", (api, $q) => {
                    let deferred = $q.defer();

                    let authData = api.getAuth();
                    if (authData) {
                        // auth good
                        $rootScope.user = authData;
                        deferred.resolve();
                    }
                    else {
                        // auth bad
                        deferred.reject();
                        api.login(toState, toParams);
                    }

                    return deferred.promise;
                }];
            }
        });
    }
]);

app
    .config(router)
    .service("api", API)
    .service("errorService", ErrorService)
    .directive("gcciLogin", gcciLogin)
    .directive("gcciMessage", gcciMessage)
    .controller("MainCtrl", MainCtrl)
    .controller("HomeCtrl", HomeCtrl)
    .controller("SurveyCtrl", SurveyCtrl)
    .controller("ReportCtrl", ReportCtrl)
;