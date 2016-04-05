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
    "controller": "HomeCtrl as vm",
    "resolve": {}
  })

  .state("survey", {
    "url": "/survey",
    "templateUrl": url("survey"),
    "controller": "SurveyCtrl as vm",
    "resolve": {}
  })

  .state("instruction", {
    "url": "/instruction",
    "templateUrl": url("instruction"),
    "resolve": {}
  })

  .state("report", {
    "url": "/report",
    "template": "<ui-view></ui-view>",
    "abstract": true
  })

  .state("report.qtr", {
    "url": "/qtr",
    "templateUrl": url("report"),
    "controller": "ReportCtrl as vm",
    "resolve": {}
  })

  .state("report.health", {
    "url": "/health",
    "templateUrl": url("report"),
    "controller": "ReportCtrl as vm",
    "resolve": {}
  })

  .state("report.category", {
    "url": "/category",
    "templateUrl": url("report"),
    "controller": "ReportCtrl as vm",
    "resolve": {}
  })
  ;
}

router.$inject = ["$stateProvider", "$urlRouterProvider", "$uiViewScrollProvider"];
