import { router } from './router';
import { ErrorService, UtilService, AuthService } from './service';
import { gcciLogin } from './directives/gcci-login';
import { gcciMessage } from './directives/gcci-message';
import { MainCtrl, HomeCtrl } from './controllers/main';
import { SurveyCtrl } from './controllers/survey';
import { ReportCtrl } from './controllers/report';
import { API } from '../libs/model-api/api';


var app = angular.module("app", ["ngSanitize", "ui.router", "firebase"]);

app.config(["$httpProvider", ($httpProvider) => {
  if (!$httpProvider.defaults.headers.get) {
    $httpProvider.defaults.headers.get = {};
  }
  $httpProvider.defaults.headers.get["Cache-Control"] = "no-cache";
  $httpProvider.defaults.headers.get["Pragma"] = "no-cache";
  $httpProvider.defaults.headers.get["If-Modified-Since"] = "0";
}]);

app.run(["$rootScope", ($rootScope) => {
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

  // firebase root reference
  $rootScope.fbRef = new Firebase("https://gcci-cell-survey.firebaseio.com");

  // global user data
  $rootScope.user = null;

  // GCCI Model API
  $rootScope.api = new API(new Firebase("https://gcci-model.firebaseio.com"));

  // get authentication state
  $rootScope.$on("$stateChangeStart", (evt, toState) => {
    // add auth check in state's resolve
    if (toState.resolve !== undefined && !toState.resolve.hasOwnProperty("stateAuth")) {
      toState.resolve.stateAuth = ["authService", "$q", (authService, $q) => {
        let deferred = $q.defer();

        authService.getAuth().then(() => {
          deferred.resolve();
        }, () => {
          deferred.reject();
          if (toState.name !== "home") {
            authService.login();
          }
        });

        return deferred.promise;
      }];
    }
  });
}]);

app
.config(router)
.service("errorService", ErrorService)
.service("utilService", UtilService)
.service("authService", AuthService)

.directive("gcciLogin", gcciLogin)
.directive("gcciMessage", gcciMessage)

.controller("MainCtrl", MainCtrl)
.controller("HomeCtrl", HomeCtrl)
.controller("SurveyCtrl", SurveyCtrl)
.controller("ReportCtrl", ReportCtrl)
;
