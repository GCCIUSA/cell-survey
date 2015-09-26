import {router} from './router';
import {gcciLogin} from './directives/gcci-login';
import {gcciMessage} from './directives/gcci-message';
import {MainCtrl, HomeCtrl} from './controllers/main';
import {SurveyCtrl} from './controllers/survey';
import {ReportCtrl} from './controllers/report';


var app = angular.module("app", ["ngSanitize", "ui.router"]);

app.run(["$rootScope",
    ($rootScope) => {
        // global directives
        $rootScope.gcciMessage = { "toggle": false };
    }
]);

app
    .config(router)
    .directive("gcciLogin", gcciLogin)
    .directive("gcciMessage", gcciMessage)
    .controller("MainCtrl", MainCtrl)
    .controller("HomeCtrl", HomeCtrl)
    .controller("SurveyCtrl", SurveyCtrl)
    .controller("ReportCtrl", ReportCtrl)
;