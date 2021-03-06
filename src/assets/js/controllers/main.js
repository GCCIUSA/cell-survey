export class MainCtrl {
  constructor($state, authService, permissionService, GCCIMessage) {
    this.$state = $state;
    this.authService = authService;
    this.permissionService = permissionService;
    this.GCCIMessage = GCCIMessage;

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
    return this.authService.getUser().google.displayName;
  }

  logout() {
    this.authService.logout(true);
  }

  showSurveyTab() {
    return this.permissionService.canAccessSurvey();
  }

  showReportTab() {
    return this.permissionService.canAccessReport();
  }
}

MainCtrl.$inject = ["$state", "authService", "permissionService", "GCCIMessage"];

export class HomeCtrl {
  constructor(authService, permissionService) {
    this.authService = authService;
    this.permissionService = permissionService;
  }
}

HomeCtrl.$inject = ["authService", "permissionService"];
