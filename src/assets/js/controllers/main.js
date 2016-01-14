export class MainCtrl {
    constructor($state, authService, $rootScope) {
        this.$state = $state;
        this.authService = authService;
        this.$rootScope = $rootScope;

        this.init();
    }

    init() {
        this.navItems = [
            { "label": "Home", "state": "home" },
            { "label": "Survey", "state": "survey" }
        ];
        console.log(this.$state);
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
        this.authService.logout();
        this.$state.go("home");
    }
}

MainCtrl.$inject = ["$state", "authService", "$rootScope"];

export class HomeCtrl {
    constructor() {

    }
}
