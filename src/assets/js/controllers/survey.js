export class SurveyCtrl {
    constructor($http, $rootScope, api) {
        this.$http = $http;
        this.$rootScope = $rootScope;
        this.api = api;

        // answers are string array in the format of i,j,k
        // i - category index, j - item index, k - option index
        // example: ["0,1,1", "0,2,1"]
        this.answers = [];

        // total score
        this.totalScore = 0;

        this.init();
    }

    init() {
        // TODO get existing answers

        // get survey data
        this.getSurvey();
    }

    /**
     * get survey data
     */
    getSurvey() {
        this.$http.get("survey.json").then(
            (response) => {
                this.survey = response.data;

                // count total items
                this.totalItemCnt = 0;
                for (let i = 0; i < this.survey.length; i++) {
                    this.totalItemCnt += this.survey[i].items.length;
                }
            }
        );
    }

    /**
     * selects(check/uncheck) an item
     */
    select(categoryIndex, itemIndex, optionIndex) {
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
        for (let i = 0; i < this.answers.length; i++) {
            totalScore += parseInt(this.answers[i].split(",")[2]);
        }
        this.totalScore = totalScore;
    }

    /**
     * submit the survey
     */
    submitSurvey() {
        // validate survey before submitting
        if (this.validateSurvey()) {
            this.api.submitSurvey(this.answers);
        }
    }

    /**
     * validate survey
     */
    validateSurvey() {
        // check total item count
        if (this.answers.length !== this.totalItemCnt) {
            this.$rootScope.gcciMessage = {
                "toggle": true,
                "type": "danger",
                "title": "Incomplete Survey",
                "body": "Please fill out all items on the survey."
            };
            return false;
        }
        return true;
    }
}

SurveyCtrl.$inject = ["$http", "$rootScope", "api"];