export class SurveyCtrl {
    constructor($http, $rootScope, $q, utilService, $firebaseArray, stateAuth) {
        this.$http = $http;
        this.$rootScope = $rootScope;
        this.$q = $q;
        this.utilService = utilService;
        this.$firebaseArray = $firebaseArray;
        this.stateAuth = stateAuth;

        this.init();
    }

    init() {
        let surveyConfig = this.$http.get("survey.json"),
            surveyForms = this.$http.get("forms.json");

        this.$q.all([surveyConfig, surveyForms]).then((response) => {
            this.currentSurvey = response[0].data[0];

            let today = new Date().getTime(),
                openFrom = new Date(this.currentSurvey.openPeriod[0]).getTime(),
                openUntil = new Date(this.currentSurvey.openPeriod[1]).getTime();

            if (today >= openFrom && today <= openUntil) {
                this.currentSurvey.form = response[1].data.find(form => form.ver === this.currentSurvey.formVer).form;

                this.$rootScope.fbRef.orderByChild("uid").equalTo(this.$rootScope.user.uid).once("value", (snapshot) => {
                    // answers are string array in the format of i,j,k
                    // i - category index, j - item index, k - option index
                    // example: ["0,1,1", "0,2,1"]
                    this.currentSurvey.answers = this.utilService.arrayFromSnapshotVal(snapshot.val()).find(ans => ans.surveyId === this.currentSurvey.id);
                    this.getTotalScore();
                });
            }
        });
    }

    /**
     * selects(check/uncheck) an item
     */
    select(categoryIndex, itemIndex, optionIndex) {
        if (this.submitted) {
            return;
        }
        let answer = `${categoryIndex},${itemIndex},${optionIndex}`;

        let answerIndex = this.currentSurvey.answers.indexOf(answer);
        // uncheck answer if already checked
        if (answerIndex >= 0) {
            this.currentSurvey.answers.splice(answerIndex, 1);
        }
        else {
            // select different option
            let itemFound = false;
            for (let i = 0; i < this.currentSurvey.answers.length; i++) {
                let answerSplit = this.currentSurvey.answers[i].split(",");
                if (categoryIndex === parseInt(answerSplit[0]) && itemIndex === parseInt(answerSplit[1])) {
                    this.currentSurvey.answers[i] = answer;
                    itemFound = true;
                    break;
                }
            }
            // add new answer
            if (!itemFound) {
                this.currentSurvey.answers.push(answer);
            }
        }

        this.getTotalScore();
    }

    /**
     * determines if an answer is selected
     */
    isSelectedAnswer(categoryIndex, itemIndex, optionIndex) {
        let answer = `${categoryIndex},${itemIndex},${optionIndex}`;
        return this.currentSurvey.answers.indexOf(answer) >= 0;
    }

    /**
     * determines if an item has answer selected
     */
    isItemSelected(categoryIndex, itemIndex) {
        return this.currentSurvey.answers.find(x => x.indexOf(`${categoryIndex},${itemIndex},`) >= 0);
    }

    /**
     * cacluate total score
     */
    getTotalScore() {
        let totalScore = 0;
        for (let answer of this.currentSurvey.answers) {
            totalScore += parseInt(answer.split(",")[2]);
        }
        this.totalScore = totalScore;
    }

    /**
     * submit the survey
     */
    submitSurvey() {
        if (this.validateSurveyForm()) {
            this.$firebaseArray(this.$rootScope.fbRef).$add({
                "uid": this.$rootScope.user.uid,
                "date": new Date().getTime(),
                "surveyId": this.currentSurvey.id,
                "answers": this.currentSurvey.answers
            });
        }
    }

    /**
     * validate survey form
     */
    validateSurveyForm() {
        // check total item count
        if (this.currentSurvey.answers.length !== this.totalItemCnt) {
            this.$rootScope.gcciMessage.alert(
                "danger",
                "Incomplete Survey",
                "Please answer all questions on the survey."
            );
            return false;
        }
        return true;
    }
}

SurveyCtrl.$inject = ["$http", "$rootScope", "$q", "utilService", "$firebaseArray", "stateAuth"];