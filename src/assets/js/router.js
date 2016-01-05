export function router($stateProvider, $urlRouterProvider, $uiViewScrollProvider) {
    let url = (page) => {
        return `assets/partials/${page}.html`;
    };

    $uiViewScrollProvider.useAnchorScroll();
    $urlRouterProvider.otherwise("/home");

    $stateProvider
        .state("home", {
            "url": "/home",
            "templateUrl": url("home"),
            "controller": "HomeCtrl as vm"
        })

        .state("survey", {
            "url": "/survey",
            "templateUrl": url("survey"),
            "controller": "SurveyCtrl as vm",
            "resolve": {}
        })

        .state("report", {
            "url": "/report",
            "templateUrl": url("report"),
            "controller": "ReportCtrl as vm",
            "resolve": {}
        })
    ;
}

router.$inject = ["$stateProvider", "$urlRouterProvider", "$uiViewScrollProvider"];
