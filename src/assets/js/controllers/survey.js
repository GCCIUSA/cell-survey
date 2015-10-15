export class SurveyCtrl {
    constructor($http, $rootScope, api) {
        this.$http = $http;
        this.$rootScope = $rootScope;
        this.api = api;

        // total score
        this.totalScore = 0;

        // answers are string array in the format of i,j,k
        // i - category index, j - item index, k - option index
        // example: ["0,1,1", "0,2,1"]
        this.answers = [];

        // if the survey has been submitted.
        this.submitted = true;

        this.init();
    }

    init() {
        this.api.getSurveyByUser(this.$rootScope.user.uid).then((data) => {
            this.getSurveyForm();

            if (data === null) {
                this.submitted = false;
            }
            else {
                let surveyKeys = Object.keys(data);
                this.answers = data[surveyKeys[0]].answers;
                this.getTotalScore();
            }
        });
    }

    /**
     * get survey data
     */
    getSurveyForm() {
        this.$http.get("survey.json").then(
            (response) => {
                this.surveyForm = response.data;

                // count total items
                this.totalItemCnt = 0;
                for (let category of this.surveyForm) {
                    this.totalItemCnt += category.items.length;
                }
            }
        );
    }

    /**
     * selects(check/uncheck) an item
     */
    select(categoryIndex, itemIndex, optionIndex) {
        if (this.submitted) {
            return;
        }
        let answer = `${categoryIndex},${itemIndex},${optionIndex}`;

        let answerIndex = this.answers.indexOf(answer);
        // uncheck answer if already checked
        if (answerIndex >= 0) {
            this.answers.splice(answerIndex, 1);
        }
        else {
            // select different option
            let itemFound = false;
            for (let i = 0; i < this.answers.length; i++) {
                let answerSplit = this.answers[i].split(",");
                if (categoryIndex === parseInt(answerSplit[0]) && itemIndex === parseInt(answerSplit[1])) {
                    this.answers[i] = answer;
                    itemFound = true;
                    break;
                }
            }
            // add new answer
            if (!itemFound) {
                this.answers.push(answer);
            }
        }

        this.getTotalScore();
    }

    /**
     * determines if an answer is selected
     */
    isSelectedAnswer(categoryIndex, itemIndex, optionIndex) {
        let answer = `${categoryIndex},${itemIndex},${optionIndex}`;
        return this.answers.indexOf(answer) >= 0;
    }

    /**
     * determines if an item has answer selected
     */
    isItemSelected(categoryIndex, itemIndex) {
        return this.answers.find(x => x.indexOf(`${categoryIndex},${itemIndex},`) >= 0);
    }

    /**
     * cacluate total score
     */
    getTotalScore() {
        let totalScore = 0;
        for (let answer of this.answers) {
            totalScore += parseInt(answer.split(",")[2]);
        }
        this.totalScore = totalScore;
    }

    /**
     * submit the survey
     */
    submitSurvey() {
        // validate survey form before submitting
        //if (this.validateSurveyForm()) {
            this.api.submitSurvey(this.$rootScope.user.uid, this.answers);
        //}
    }

    /**
     * validate survey form
     */
    validateSurveyForm() {
        // check total item count
        if (this.answers.length !== this.totalItemCnt) {
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

SurveyCtrl.$inject = ["$http", "$rootScope", "api"];