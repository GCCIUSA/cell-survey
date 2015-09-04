app.controller("MainCtrl", ["$http",
    function ($http) {
        var vm = this;

        $http.get("survey.json").then(function (response) {
            vm.survey = response.data;
        });

        vm.answers = [];
        vm.select = function (categoryIndex, itemIndex, optionIndex) {
            var answer = categoryIndex + "," + itemIndex + "," + optionIndex;
            if (vm.answers.indexOf(answer) >= 0) {
                vm.answers.splice(vm.answers.indexOf(answer), 1);
            }
            else {
                var itemFound = false;
                for (var i = 0; i < vm.answers.length; i++) {
                    var answerSplit = vm.answers[i].split(",");
                    if (categoryIndex === parseInt(answerSplit[0]) && itemIndex === parseInt(answerSplit[1])) {
                        vm.answers[i] = answer;
                        itemFound = true;
                        break;
                    }
                }
                if (!itemFound) {
                    vm.answers.push(answer);
                }
            }
        };

        vm.totalScore = function () {
            var score = 0;
            for (var i = 0; i < vm.answers.length; i++) {
                score += parseInt(vm.answers[i].split(",")[2]);
            }

            return score;
        };

        vm.isSelectedAnswer = function (categoryIndex, itemIndex, optionIndex) {
            var answer = categoryIndex + "," + itemIndex + "," + optionIndex;
            return vm.answers.indexOf(answer) >= 0;
        }
    }
]);