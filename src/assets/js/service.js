export class ErrorService {
  constructor() {

  }

  throwError(message) {

  }
}


export class AuthService {
  constructor($rootScope, $firebaseAuth, $q, $http, $state) {
    this.$rootScope = $rootScope;
    this.$q = $q;
    this.$http = $http;
    this.$state = $state;

    this.fbAuth = $firebaseAuth(this.$rootScope.fbRef);
  }

  getAuth() {
    /**
    * need to check both firebase token and google token.
    * firebase token is for firebase services, google token is for google api service.
    *
    * firebase token is set to expired in 24 hours, google access token is set to expired in 1 hour,
    * will need to use google refresh token to refresh google access token.
    *
    * unfortunately, as of now, there's no way for firebase to obtain a google refresh token, will have to
    * re-authenticate user when google access token has expired.
    */

    let deferred = this.$q.defer();

    // check if firebase token is valid
    this.authInProgress = true;
    this.fbAuth.$onAuth((authData) => {
      if (authData) { // firebase token is valid
        // check if google token is valid
        let url = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${authData.google.accessToken}`;
        this.$http.get(url).then(
          () => { // google token is valid
            this.authInProgress = false;

            // get user node from GCCI structure model
            this.$rootScope.api.getNodeByUid(authData.auth.uid).then((nodes) => {
              this.$rootScope.user = authData;
              this.$rootScope.user.models = nodes;
              deferred.resolve();
            }).fail(() => {
              this.$rootScope.gcciMessage.alert(
                "danger",
                "Authentication Failed",
                "Authentication failed, please contact administrator for access.",
                () => { this.logout(); }
              );
            });
          },
          (error) => { // google token is invalid
            this.authInProgress = false;
            if (error.data.error === "invalid_token") {
              this.$rootScope.gcciMessage.alert(
                "danger",
                "Authentication Timeout",
                "Authentication timed out, please login again."
              );
            }
            deferred.reject(error);
          }
        );
      }
      else { // firebase token is invalid
        this.authInProgress = false;
        deferred.reject();
      }
    });

    return deferred.promise;
  }

  login() {
    let options = {
      "scope": [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/admin.directory.user.readonly"
      ].join(" ")
    };

    this.fbAuth.$authWithOAuthRedirect("google", options).catch(() => {
      this.$rootScope.gcciMessage.alert(
        "danger",
        "Authentication Error",
        "Authentication failed, please try again."
      );
    });
  }

  logout() {
    this.fbAuth.$unauth();
  }
}

AuthService.$inject = ["$rootScope", "$firebaseAuth", "$q", "$http", "$state"];


export class UtilService {
  constructor() {

  }

  arrayFromSnapshotVal(val) {
    let arr = [];

    if (val !== null) {
      for (let key of Object.keys(val)) {
        arr.push(val[key]);
      }
    }

    return arr;
  }

  getAttr(obj, attr, defaultVal = undefined) {
    return obj.hasOwnProperty(attr) ? obj[attr] : defaultVal;
  }

  displayDate(val) {
    if (val) {
      let d = this.setLocaleDate(val);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    }
  }

  setLocaleDate(val, isEnd = false) {
    if (val) {
      let d = new Date(),
      dp = val.split("-");

      d.setFullYear(dp[0]);
      d.setMonth(parseInt(dp[1]) - 1);
      d.setDate(dp[2]);

      if (isEnd) {
        d.setHours(23);
        d.setMinutes(59);
        d.setSeconds(59);
      }
      else {
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
      }

      return d;
    }
  }
}
