app.controller("MainCtrl", ["$http", "$rootScope",
    function ($http, $rootScope) {
        var vm = this;

        // get survey data
        var totalItemCnt = 0;
        $http.get("survey.json").then(function (response) {
            vm.survey = response.data;

            // count total items
            for (var i = 0; i < vm.survey.length; i++) {
                totalItemCnt += vm.survey[i].items.length;
            }
        });

        // user selects(check/uncheck) an item and calculate total score
        // answers are string array in the format of i,j,k
        // i - category index, j - item index, k - option index
        vm.answers = [];
        vm.totalScore = 0;
        vm.select = function (categoryIndex, itemIndex, optionIndex) {
            var answer = categoryIndex + "," + itemIndex + "," + optionIndex;

            // remove answer
            if (vm.answers.indexOf(answer) >= 0) {
                vm.answers.splice(vm.answers.indexOf(answer), 1);
                vm.totalScore -= optionIndex;
            }
            else {
                // select different option
                var itemFound = false;
                for (var i = 0; i < vm.answers.length; i++) {
                    var answerSplit = vm.answers[i].split(",");
                    if (categoryIndex === parseInt(answerSplit[0]) && itemIndex === parseInt(answerSplit[1])) {
                        vm.totalScore -= answerSplit[2];
                        vm.answers[i] = answer;
                        vm.totalScore += optionIndex;
                        itemFound = true;
                        break;
                    }
                }
                // add new answer
                if (!itemFound) {
                    vm.answers.push(answer);
                    vm.totalScore += optionIndex;
                }
            }
        };

        // if an answer is selected
        vm.isSelectedAnswer = function (categoryIndex, itemIndex, optionIndex) {
            var answer = categoryIndex + "," + itemIndex + "," + optionIndex;
            return vm.answers.indexOf(answer) >= 0;
        };

        vm.submitSurvey = function () {
            validateSurvey();
        };

        var validateSurvey = function () {
            // check total item count
            if (vm.answers.length !== totalItemCnt) {
                $rootScope.gcciMessage = {
                    "toggle": true,
                    "type": "danger",
                    "title": "Incomplete Survey",
                    "body": "Please fill out all items on the survey."
                };
                return false;
            }
            return true;
        };
    }
]);