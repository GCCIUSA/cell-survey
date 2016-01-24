export class ReportCtrl {
  constructor($rootScope, utilService, $q, $http, $state, ModelAPI, permissionService, authService) {
    this.$rootScope = $rootScope;
    this.utilService = utilService;
    this.$q = $q;
    this.$http = $http;
    this.$state = $state;
    this.ModelAPI = ModelAPI;
    this.permissionService = permissionService;
    this.authService = authService;

    this.init();
  }

  init() {
    if (!this.permissionService.canAccessReport()) {
      this.permissionService.redirectHome();
    }

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
              this.genHealthChart(0, $("#healthChart"));
              this.genHealthChart(1, $("#health1Chart"));
              this.genHealthChart(2, $("#health2Chart"));
            }
            else if (this.$state.current.name === "report.category") {
              this.genCategoryChart(3);
            }
          });
        });
      });
    });

    this.fontSize = 16;
  }

  genQtrChart(numQtr) {
    let chartData = [], index = 0;

    let showDetail = (e) => {
      this.$rootScope.$apply(() => {
        this.selectedSurvey = e.dataPoint.survey;
        this.selectedSurveyModel = e.dataPoint.model;
        this.selectedSurveyConfig = this.surveyConfig.find(cfg => cfg.id === this.selectedSurvey.surveyId);
        this.selectedSurveyForm = this.surveyForms.find(form => form.ver === this.selectedSurveyConfig.formVer).form;
        this.getCategoryScore();
      });
      $(".modal-body").css("max-height", $(window).height() * 0.7);
      $(".modal-dialog").css("width", $("#reportCharts").width() * 0.9);
      $("#reportDetailModal")
        .off("shown.bs.modal")
        .on("shown.bs.modal", () => {
          $(".modal-body").animate({ "scrollTop": 0});
          this.genCellCategoryChart(numQtr);
        })
        .on("hidden.bs.modal", () => {
          $("#categoryChart").empty();
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
              dataPoint.model = descendant;
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
      "animationEnabled": true,
      "axisY": {
        "minimum": 0,
        "maximum": 105,
        "labelFontSize": this.fontSize,
        "interval": 10
      },
      "axisX": {
        "labelFontSize": this.fontSize,
        "interval": 1
      },
      "legend": {
        "fontSize": this.fontSize,
        "verticalAlign": "top"
      },
      "dataPointMaxWidth": 20,
      "data": chartData
    });
  }

  genCellCategoryChart(numQtr) {
    let chartData = [], index = 0;

    let showForm = (e) => {
      this.$rootScope.$apply(() => {
        this.selectedSurvey = e.dataPoint.survey;
        this.selectedSurveyConfig = this.surveyConfig.find(cfg => cfg.id === this.selectedSurvey.surveyId);
        this.selectedSurveyForm = this.surveyForms.find(form => form.ver === this.selectedSurveyConfig.formVer).form;
        this.getCategoryScore();
      });
    };

    for (let surveyVer of this.surveyConfig) {
      if (index >= this.surveyConfig.length - numQtr) {
        let statsPeriodData = {
          "type": "column",
          "showInLegend": true,
          "legendText": surveyVer.statsPeriod,
          "indexLabel": "{y}",
          "indexLabelFontColor": "#000",
          "indexLabelFontSize": this.fontSize,
          "dataPoints": [],
          "click": showForm
        };

        for (let survey of this.reportData) {
          if (survey.surveyId === surveyVer.id && survey.uid === this.selectedSurvey.uid) {
            // assume categories of all form versions are the same
            let surveyForm = this.surveyForms[0].form;
            for (let catIndex = 0; catIndex < surveyForm.length; catIndex++) {
              let catScore = 0;
              survey.answers.filter(x => parseInt(x.split(",")[0]) === catIndex).map(x => catScore += parseInt(x.split(",")[2]));

              statsPeriodData.dataPoints.push({
                "label": surveyForm[catIndex].title,
                "y": catScore,
                "survey": survey
              });
            }
          }
        }
        chartData.push(statsPeriodData);
      }
      index++;
    }

    $("#cellCategoryChart").CanvasJSChart({
      "title": {
        "text": "小家健康分項明細表",
        "fontSize": 22,
      },
      "animationEnabled": true,
      "axisY": {
        "minimum": 0,
        "maximum": 24,
        "labelFontSize": this.fontSize,
        "interval": 5
      },
      "axisX": {
        "labelFontSize": this.fontSize
      },
      "legend": {
        "fontSize": this.fontSize,
        "verticalAlign": "top"
      },
      "data": chartData
    });
  }

  genCategoryChart(numQtr) {
    let chartData = [], index = 0;

    for (let surveyVer of this.surveyConfig) {
      if (index >= this.surveyConfig.length - numQtr) {
        let statsPeriodData = {
          "type": "column",
          "showInLegend": true,
          "legendText": surveyVer.statsPeriod,
          "indexLabel": "{y}",
          "indexLabelFontColor": "#000",
          "indexLabelFontSize": this.fontSize,
          "dataPoints": [],
        };


        // assume categories of all form versions are the same
        let surveyForm = this.surveyForms[0].form;
        for (let catIndex = 0; catIndex < surveyForm.length; catIndex++) {
          let catScore = 0;
          let catCount = 0;
          for (let survey of this.reportData) {
            if (survey.surveyId === surveyVer.id) {
              survey.answers.filter(x => parseInt(x.split(",")[0]) === catIndex).map(x => catScore += parseInt(x.split(",")[2]));
              catCount++;
            }
          }
          statsPeriodData.dataPoints.push({
            "label": surveyForm[catIndex].title,
            "y": Math.round(catScore / catCount * 10) / 10
          });
        }
        chartData.push(statsPeriodData);
      }
      index++;
    }

    $("#categoryChart").CanvasJSChart({"animationEnabled": true,
      "axisY": {
        "minimum": 0,
        "maximum": 24,
        "labelFontSize": this.fontSize,
        "interval": 5
      },
      "axisX": {
        "labelFontSize": this.fontSize
      },
      "legend": {
        "fontSize": this.fontSize,
        "verticalAlign": "top"
      },
      "data": chartData
    });
  }

  genHealthChart(numPrev, container) {
    if (this.surveyConfig.length <= numPrev) {
      return;
    }
    let chartData = [{
      "type": "pie",
      "indexLabel": "{label} #percent% ({y})",
      "indexLabelFontSize": this.fontSize,
			"percentFormatString": "#0.##",
			"toolTipContent": "#percent% ({y})",
      "dataPoints": []
    }];
    let currentSurvey = this.surveyConfig[this.surveyConfig.length - numPrev - 1];

    let totalSurveyCount = 0;
    let healthData = {};
    for (let i = 1; i <= 100; i+=20) {
      healthData[this.utilService.healthStatus(i)] = 0;
    }
    for (let survey of this.reportData) {
      if (survey.surveyId === currentSurvey.id) {
        healthData[this.utilService.healthStatus(survey.totalScore)]++;
        totalSurveyCount++;
      }
    }

    for (let healthStatus of Object.keys(healthData)) {
      chartData[0].dataPoints.push({
        "y": healthData[healthStatus],
        "label": healthStatus
      })
    }

    container.CanvasJSChart({
      "title": {
        "text": currentSurvey.statsPeriod,
        "fontSize": 22,
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

  getCategoryScore() {
    let categoryScore = {};
    for (let answer of this.selectedSurvey.answers) {
      let answerSplit = answer.split(",");
      let catIndex = answerSplit[0];

      if (!categoryScore.hasOwnProperty(catIndex)) {
        categoryScore[catIndex] = 0;
      }
      categoryScore[catIndex] += parseInt(answerSplit[2]);
    }
    this.categoryScore = categoryScore;
  }

  categoryScoreLabel(score = 0) {
    return `${score}分`;
  }
}

ReportCtrl.$inject = ["$rootScope", "utilService", "$q", "$http", "$state", "ModelAPI", "permissionService", "authService"];
