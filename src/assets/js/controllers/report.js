export class ReportCtrl {
    constructor($rootScope, utilService, $q, $http, $state, ModelAPI) {
      this.$rootScope = $rootScope;
      this.utilService = utilService;
      this.$q = $q;
      this.$http = $http;
      this.$state = $state;
      this.ModelAPI = ModelAPI;

      this.init();
    }

    init() {
      

      let surveyConfig = this.$http.get("survey.json");
      let surveyForms = this.$http.get("forms.json");

      this.$rootScope.appRef.once("value", snapshot => {
        let surveyData = this.utilService.arrayFromSnapshotVal(snapshot.val());

        this.ModelAPI.getTree().then(tree => {
          // find current user's node with lowest depth (highest level)
          let currentUserNodes = tree.filter(node => this.utilService.getAttr(node, "leaders", "").indexOf(this.$rootScope.user.uid) >= 0);
          let currentUserNode = currentUserNodes.sort((a, b) => a.depth - b.depth)[0];

          // find survey data for descendants of current user
          this.reportData = [];
          this.ModelAPI.getDescendants(currentUserNode, ["小組"]).then(descendants => {
            this.descendants = descendants;
            let tmpReportData = [];
            for (let descendant of descendants) {
              let dReportData = [];
              for (let surveyDataItem of surveyData) {
                if (this.utilService.getAttr(descendant, "leaders", "").indexOf(surveyDataItem.uid) >= 0) {
                  dReportData.push(surveyDataItem);
                }
              }
              tmpReportData = tmpReportData.concat(dReportData);
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

              if (this.$state.current.name === "report.qtr") {
                this.genQtrChart(3);
              }
              else if (this.$state.current.name === "report.health") {
                this.genHealthChart();
                this.genHealthChart(true);
              }
            });
          });
        });
      });

      this.fontSize = 16;
      this.titleSize = 30;
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
            "legendText": surveyVer.statsPeriod,
            "indexLabel": "{y}",
            "indexLabelFontColor": "#000",
            "indexLabelFontSize": this.fontSize,
            "dataPoints": [],
            "click": showDetail
          };
          for (let descendant of this.descendants) {
            let dataPoint = {
              "label": descendant.title,
              "y": 0
            };
            for (let survey of this.reportData) {
              if (this.utilService.getAttr(descendant, "leaders", "").indexOf(survey.uid) >= 0 && survey.surveyId === surveyVer.id) {
                dataPoint.y = survey.totalScore;
                dataPoint.survey = survey;
                break;
              }
            }
            statsPeriodData.dataPoints.push(dataPoint);
          }
          chartData.push(statsPeriodData);
        }
        index++;
      }

      let chartHeight = chartData[0].dataPoints.length * chartData.length * 30 + 120;
      $("#qtrChart").css("height", `${chartHeight}px`).CanvasJSChart({
        "title": {
          "text": "季度報表",
          "fontSize": this.titleSize,
        },
        "animationEnabled": true,
        "axisY": {
          "minimum": 0,
          "maximum": 100,
          "labelFontSize": this.fontSize
        },
        "axisX": {
          "labelFontSize": this.fontSize,
          "interval": 1
        },
        "legend": {
          "fontSize": this.fontSize
        },
        "dataPointMaxWidth": 20,
        "data": chartData
      });
    }

    genHealthChart(isPrev) {
      let chartData = [{
        "type": "pie",
        "indexLabel": "{label} #percent% ({y})",
        "indexLabelFontSize": this.fontSize,
  			"percentFormatString": "#0.##",
  			"toolTipContent": "#percent% ({y})",
        "dataPoints": []
      }];
      let currentSurvey = this.surveyConfig[this.surveyConfig.length - (isPrev ? 2 : 1)];

      let healthData = {
        "very_unhealth": [0, "很不健康"],
        "unhealthy": [0, "不健康"],
        "somewhat_healty": [0, "尚且健康"],
        "healty": [0, "健康"],
        "very_healthy": [0, "非常健康"]
      };
      let totalSurveyCount = 0;
      for (let survey of this.reportData) {
        if (survey.surveyId === currentSurvey.id) {
          if (survey.totalScore > 80) {
            healthData["very_healthy"][0]++;
          }
          else if (survey.totalScore > 60) {
            healthData["healty"][0]++;
          }
          else if (survey.totalScore > 40) {
            healthData["somewhat_healty"][0]++;
          }
          else if (survey.totalScore > 20) {
            healthData["unhealthy"][0]++;
          }
          else {
            healthData["very_unhealth"][0]++;
          }
          totalSurveyCount++;
        }
      }

      for (let healthStatus of Object.keys(healthData)) {
        chartData[0].dataPoints.push({
          "y": healthData[healthStatus][0],
          "label": healthData[healthStatus][1]
        })
      }

      $(isPrev ? "#healthChartPrevQtr" : "#healthChart").CanvasJSChart({
        "title": {
          "text": `健康報表 (${currentSurvey.statsPeriod})`,
          "fontSize": this.titleSize,
        },
        "animationEnabled": true,
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

ReportCtrl.$inject = ["$rootScope", "utilService", "$q", "$http", "$state", "ModelAPI"];
