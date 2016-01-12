export class ReportCtrl {
    constructor($rootScope, utilService, $q, $http) {
      this.$rootScope = $rootScope;
      this.utilService = utilService;
      this.$q = $q;
      this.$http = $http;

      this.init();
    }

    init() {
      let surveyConfig = this.$http.get("survey.json");
      let surveyForms = this.$http.get("forms.json");

      this.$rootScope.fbRef.once("value", snapshot => {
        let surveyData = this.utilService.arrayFromSnapshotVal(snapshot.val());

        this.$rootScope.api.getTree().then(tree => {
          // find current user's node with lowest depth (highest level)
          let currentUserNodes = tree.filter(node => this.utilService.getAttr(node, "leaders", "").indexOf(this.$rootScope.user.uid) >= 0);
          let currentUserNode = currentUserNodes.sort((a, b) => a - b)[0];

          // find survey data for descendants of current user
          this.reportData = [];
          this.$rootScope.api.getDescendants(currentUserNode).then(descendants => {
            let tmpReportData = [];
            for (let descendant of descendants) {
              tmpReportData = tmpReportData.concat(surveyData.filter(survey => this.utilService.getAttr(descendant, "leaders", "").indexOf(survey.uid) >= 0));
            }
            this.reportData = tmpReportData;

            // calculate total scores for each survey
            for (let survey of this.reportData) {
              survey.totalScore = this.getTotalScore(survey.answers);
            }

            // get survey config and forms
            this.$q.all([surveyConfig, surveyForms]).then(response => {
              this.surveyConfig = response[0].data;
              this.surveyForms = response[1].data;

              this.genQtrChart(3);
            });
          });
        });
      });
    }

    genQtrChart(numQtr) {
      let scoreChartData = [], index = 0;

      for (let surveyVer of this.surveyConfig) {
        if (index >= this.surveyConfig.length - numQtr) {
          let statsPeriodData = {
            "type": "column",
            "showInLegend": true,
            "legendText": surveyVer.statsPeriod[1],
            "indexLabel": "{y}",
            "indexLabelPlacement": "outside",
            "indexLabelOrientation": "horizontal",
            "dataPoints": []
          };
          for (let survey of this.reportData) {
            if (survey.surveyId === surveyVer.id) {
              statsPeriodData.dataPoints.push({ "label": survey.displayName, "y": survey.totalScore});
            }
          }
          scoreChartData.push(statsPeriodData);
        }
        index++;
      }

      $("#qtrChart").CanvasJSChart({
        "title": {
          "text": "Quarterly Report"
        },
        "axisY": {
          "minimum": 0,
          "maximum": 100
        },
        "data": scoreChartData
      });
    }

    getTotalScore(answers) {
      let totalScore = 0;
      for (let answer of answers) {
        totalScore += parseInt(answer.split(",")[2]);
      }
      return totalScore;
    }
}

ReportCtrl.$inject = ["$rootScope", "utilService", "$q", "$http"];
