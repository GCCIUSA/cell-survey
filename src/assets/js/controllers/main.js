export class MainCtrl {
  constructor($state, authService, $rootScope, GCCIMessage, utilService) {
    this.$state = $state;
    this.authService = authService;
    this.$rootScope = $rootScope;
    this.GCCIMessage = GCCIMessage;
    this.utilService = utilService;

    this.init();
  }

  init() {
  }

  isActiveNav(name) {
    if (name === "report") {
      return this.$state.current.name.indexOf("report.") === 0;
    }
    else {
      return this.$state.current.name === name;
    }
  }

  getUserDisplayName() {
    return this.$rootScope.user.google.displayName;
  }

  logout() {
    this.authService.logout();
    this.$state.go("home");
  }

  showSurveyTab() {
    return this.authService.isLoggedIn() && this.utilService.userHasLevels(["小組"]);
  }

  showReportTab() {
    return this.authService.isLoggedIn() && this.utilService.userHasLevels(["牧區", "區", "實習區"]);
  }
}

MainCtrl.$inject = ["$state", "authService", "$rootScope", "GCCIMessage", "utilService"];

export class HomeCtrl {
  constructor() {

  }
}

HomeCtrl.$inject = [];
