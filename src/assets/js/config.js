import { router } from './router';
import { ErrorService, UtilService, AuthService } from './service';
import { gcciMessage } from './directives/gcci-message';
import { MainCtrl, HomeCtrl } from './controllers/main';
import { SurveyCtrl } from './controllers/survey';
import { ReportCtrl } from './controllers/report';
import { ModelAPI } from '../libs/model-api/api';


var app = angular.module("app", ["ngSanitize", "ui.router", "firebase"]);

app.constant("REF", {
  "APP_REF": new Firebase("https://gcci-cell-survey.firebaseio.com"),
  "MODEL_REF": new Firebase("https://gcci-model.firebaseio.com")
});

app.config(["$httpProvider", ($httpProvider) => {
  // disable cache
  if (!$httpProvider.defaults.headers.get) {
    $httpProvider.defaults.headers.get = {};
  }
  $httpProvider.defaults.headers.get["Cache-Control"] = "no-cache";
  $httpProvider.defaults.headers.get["Pragma"] = "no-cache";
  $httpProvider.defaults.headers.get["If-Modified-Since"] = "0";
}]);

app.factory("Auth", ["$firebaseAuth", "REF", ($firebaseAuth, REF) => {
  return $firebaseAuth(REF.APP_REF);
}]);

app.factory("ModelAPI", ["REF", (REF) => {
  return new ModelAPI(REF.MODEL_REF);
}]);

app.factory("GCCIMessage", [() => {
  return class {
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
}]);

app.run(["$rootScope", "REF", ($rootScope, REF) => {
  // firebase root reference
  $rootScope.appRef = REF.APP_REF;

  // global user data
  $rootScope.user = null;

  // get authentication state
  $rootScope.$on("$stateChangeStart", (evt, toState) => {
    // add auth check in state's resolve
    if (toState.resolve !== undefined && !toState.resolve.hasOwnProperty("stateAuth")) {
      toState.resolve.stateAuth = ["authService", "$q", (authService, $q) => {
        let deferred = $q.defer();

        authService.getAuth().then(
          () => {
            deferred.resolve();
          },
          () => {
            if (toState.name === "home") {
              deferred.resolve();
            }
            else {
              deferred.reject();
            }
          }
        );

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

.directive("gcciMessage", gcciMessage)

.controller("MainCtrl", MainCtrl)
.controller("HomeCtrl", HomeCtrl)
.controller("SurveyCtrl", SurveyCtrl)
.controller("ReportCtrl", ReportCtrl)
;
