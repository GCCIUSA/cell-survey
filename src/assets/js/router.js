export function router($stateProvider, $urlRouterProvider, $uiViewScrollProvider) {
    $uiViewScrollProvider.useAnchorScroll();
    $urlRouterProvider.otherwise("/home");

    $stateProvider
        .state("home", {
            "url": "/home",
            "templateUrl": "partials/home.html",
            "controller": "HomeCtrl as home"
        })

        .state("survey", {
            "url": "/survey",
            "templateUrl": "partials/survey.html",
            "controller": "SurveyCtrl as survey"
        })

        .state("report", {
            "url": "/report",
            "templateUrl": "partials/report.html",
            "controller": "ReportCtrl as report"
        })
    ;
}

router.$inject = ["$stateProvider", "$urlRouterProvider", "$uiViewScrollProvider"];