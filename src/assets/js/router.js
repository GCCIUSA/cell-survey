app
    .config(["$stateProvider", "$urlRouterProvider", "$uiViewScrollProvider",
        ($stateProvider, $urlRouterProvider, $uiViewScrollProvider) => {
            $uiViewScrollProvider.useAnchorScroll();
            $urlRouterProvider.otherwise("/home");

            $stateProvider
                .state("home", {
                    "url": "/home",
                    "templateUrl": "partials/home.html",
                    "controller": "HomeCtrl as vm"
                })

                .state("survey", {
                    "url": "/survey",
                    "templateUrl": "partials/survey.html",
                    "controller": "SurveyCtrl as vm"
                })

                .state("report", {
                    "url": "/report",
                    "templateUrl": "partials/report.html",
                    "controller": "ReportCtrl as vm"
                })
            ;
        }
    ])
;