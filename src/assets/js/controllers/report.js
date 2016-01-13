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
          let currentUserNode = currentUserNodes.sort((a, b) => a.depth - b.depth)[0];

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
              this.genHealthChart();
              this.genHealthChart(true);
            });
          });
        });
      });
    }

    genQtrChart(numQtr) {
      let chartData = [], index = 0;

      let showDetail = (e) => {
        this.$rootScope.$apply(() => {
          this.selectedSurvey = e.dataPoint.survey;
          this.selectedSurveyConfig = this.surveyConfig.find(cfg => cfg.id === this.selectedSurvey.surveyId);
          this.selectedSurveyForm = this.surveyForms.find(form => form.ver === this.selectedSurveyConfig.formVer).form;
        });
        $(".modal-body").css("max-height", $(window).height() * 0.7);
        $(".modal-dialog").css("width", $("#reportCharts").width() * 0.9);
        $("#reportDetailModal")
          .off("shown.bs.modal")
          .on("shown.bs.modal", () => {
            $(".modal-body").animate({ "scrollTop": 0});
          })
          .modal("show");
      };

      for (let surveyVer of this.surveyConfig) {
        if (index >= this.surveyConfig.length - numQtr) {
          let statsPeriodData = {
            "type": "bar",
            "showInLegend": true,
            "legendText": surveyVer.statsPeriod[1],
            "indexLabel": "{y}",
            "indexLabelFontColor": "#000",
            "dataPoints": [],
            "click": showDetail
          };
          for (let survey of this.reportData) {
            if (survey.surveyId === surveyVer.id) {
              statsPeriodData.dataPoints.push({
                "label": survey.displayName,
                "y": survey.totalScore,
                "survey": survey
              });
            }
          }
          chartData.push(statsPeriodData);
        }
        index++;
      }

      $("#qtrChart").CanvasJSChart({
        "title": {
          "text": "Quarterly Report"
        },
        "animationEnabled": true,
        "axisY": {
          "minimum": 0,
          "maximum": 100
        },
        "data": chartData
      });
    }

    genHealthChart(isPrev) {
      let chartData = [{
        "type": "pie",
        "indexLabel": "{label} #percent% ({y})",
        "indexLabelFontSize": 14,
  			"percentFormatString": "#0.##",
  			"toolTipContent": "#percent% ({y})",
        "dataPoints": []
      }];
      let currentSurvey = this.surveyConfig[this.surveyConfig.length - (isPrev ? 2 : 1)];

      let healthData = {
        "Very Unhealthy": 0,
        "Unhealthy": 0,
        "Somewhat Healty": 0,
        "Healty": 0,
        "Very Healthy": 0
      };
      let totalSurveyCount = 0;
      for (let survey of this.reportData) {
        if (survey.surveyId === currentSurvey.id) {
          if (survey.totalScore > 80) {
            healthData["Very Healthy"]++;
          }
          else if (survey.totalScore > 60) {
            healthData["Healty"]++;
          }
          else if (survey.totalScore > 40) {
            healthData["Somewhat Healty"]++;
          }
          else if (survey.totalScore > 20) {
            healthData["Unhealty"]++;
          }
          else {
            healthData["Very Unhealthy"]++;
          }
          totalSurveyCount++;
        }
      }

      for (let healthStatus of Object.keys(healthData)) {
        chartData[0].dataPoints.push({
          "y": healthData[healthStatus],
          "label": healthStatus
        })
      }

      $(isPrev ? "#healthChartPrevQtr" : "#healthChart").CanvasJSChart({
        "title": {
          "text": `Health Report (${currentSurvey.statsPeriod[1]})`
        },
        "data": chartData
      })
    }

    isSelectedAnswer(categoryIndex, itemIndex, optionIndex) {
      return this.selectedSurvey.answers.indexOf(`${categoryIndex},${itemIndex},${optionIndex}`) >= 0;
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
