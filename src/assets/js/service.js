export class ErrorService {
  constructor() {

  }

  throwError(message) {

  }
}


export class AuthService {
  constructor($rootScope, $q, $http, Auth, ModelAPI, GCCIMessage) {
    this.$rootScope = $rootScope;
    this.$q = $q;
    this.$http = $http;
    this.Auth = Auth;
    this.ModelAPI = ModelAPI;
    this.GCCIMessage = GCCIMessage;
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

    this.Auth.$requireAuth().then(
      (authData) => { // firebase token is valid
        // check if google token is valid
        let url = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${authData.google.accessToken}`;
        this.$http.get(url).then(
          () => { // google token is valid
            // get user node from GCCI structure model
            this.ModelAPI.getNodeByUid(authData.auth.uid).then((nodes) => { // user in gcci model
              authData.models = nodes;
              this.setUser(authData);
              deferred.resolve();
            }).fail(() => { // user not in gcci model
              this.logout();
              this.GCCIMessage.alert(
                "danger",
                "Authentication Failed",
                "Authentication failed, please contact administrator for access.",
                () => {
                  this.logoutRedirect();
                }
              );
              deferred.reject();
            });
          },
          (error) => { // google token is invalid
            this.unsetUser();
            if (error.data.error === "invalid_token") {
              this.GCCIMessage.alert(
                "danger",
                "Authentication Timeout",
                "Authentication timed out, please login again.",
                () => {
                  this.login()
                }
              );
            }
            else {
              this.GCCIMessage.alert(
                "danger",
                "Authentication Provider Error",
                "Authentication failed for provider."
              );
            }
            deferred.reject(error);
          }
        );
      },
      (error) => { // firebase token is invalid
        this.unsetUser();
        deferred.reject(error);
      }
    );

    return deferred.promise;
  }

  login() {
    let options = {
      "scope": [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/admin.directory.user.readonly"
      ].join(" ")
    };

    this.Auth.$authWithOAuthRedirect("google", options).catch(() => {
      this.GCCIMessage.alert(
        "danger",
        "Authentication Error",
        "Authentication failed, please try again."
      );
    });
  }

  logout(redirect=false) {
    this.Auth.$unauth();
    this.unsetUser();
    if (redirect) {
      this.logoutRedirect();
    }
  }
  
  logoutRedirect() {
    window.location.href = `https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=${window.location.href}`;
  }

  isLoggedIn() {
    return this.$rootScope.user !== null;
  }

  setUser(data) {
    this.$rootScope.user = data;
  }

  unsetUser() {
    this.$rootScope.user = null;
  }

  getUser() {
    return this.$rootScope.user;
  }
}

AuthService.$inject = ["$rootScope", "$q", "$http", "Auth", "ModelAPI", "GCCIMessage"];


export class UtilService {
  constructor($rootScope) {
    this.$rootScope = $rootScope;
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

  healthStatus(score) {
    return score > 80 ? "非常健康" :
           score > 60 ? "健康" :
           score > 40 ? "尚且健康" :
           score > 20 ? "不健康" : "很不健康";
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

UtilService.$inject = ["$rootScope"];


export class PermissionService {
  constructor(authService, $state) {
    this.authService = authService;
    this.$state = $state;
  }

  canAccessSurvey() {
    return this.authService.isLoggedIn() && this.userHasLevels(["小組"]);
  }

  canAccessReport() {
    return this.authService.isLoggedIn() && this.userHasLevels(["大牧區", "牧區", "區", "實習區"]);
  }

  redirectHome() {
    this.$state.go("home");
  }

  userHasLevels(levels) {
    return this.authService.getUser().models.find(node => levels.indexOf(node.level) >= 0);
  }
}

PermissionService.$inject = ["authService", "$state"];
