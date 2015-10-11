export class MainCtrl {
    constructor($state, api, $rootScope) {
        this.$state = $state;
        this.api = api;
        this.$rootScope = $rootScope;

        this.init();
    }

    init() {
        this.navItems = [
            { "label": "Home", "state": "home" },
            { "label": "Survey", "state": "survey" },
            { "label": "Report", "state": "report" }
        ];
    }

    isActiveNav(state) {
        return this.$state.current.name === state;
    }

    getUserDisplayName() {
        return this.$rootScope.user.google.displayName;
    }

    isLoggedIn() {
        return this.$rootScope.user !== null;
    }

    logout() {
        this.api.logout();
        this.$state.go("home");
    }
}

MainCtrl.$inject = ["$state", "api", "$rootScope"];

export class HomeCtrl {
    constructor() {

    }
}