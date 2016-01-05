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
            console.log(this.reportData);

            // calculate total scores for each survey
            for (let survey of this.reportData) {
              survey.totalScore = this.getTotalScore(survey.answers);
            }

            // score chart
            let scoreChartData = [];
            for (let survey of this.reportData) {
              scoreChartData.push([survey.displayName + survey.surveyId, survey.totalScore]);
            }
            console.log(scoreChartData);
            $.plot("#scoreChart", [scoreChartData], {
                "series": {
                  "bars": {
                    "show": true,
                    "align": "center",
                    "barWidth": 0.8
                  }
                },
                "xaxis": {
                  "mode": "categories",
                },
                "yaxis": {
                  "max": 100
                }
              }
            );

            // get survey config and forms
            this.$q.all([surveyConfig, surveyForms]).then(response => {
              this.currentSurvey = response[0].data[response[0].data.length - 1];
              this.currentSurvey.form = response[1].data.find(form => form.ver === this.currentSurvey.formVer).form;
            });
          });
        });
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
