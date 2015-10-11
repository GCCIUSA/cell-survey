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
            "controller": "HomeCtrl as home"
        })

        .state("survey", {
            "url": "/survey",
            "templateUrl": url("survey"),
            "controller": "SurveyCtrl as survey",
            "resolve": {}
        })

        .state("report", {
            "url": "/report",
            "templateUrl": url("report"),
            "controller": "ReportCtrl as report"
        })
    ;
}

router.$inject = ["$stateProvider", "$urlRouterProvider", "$uiViewScrollProvider"];