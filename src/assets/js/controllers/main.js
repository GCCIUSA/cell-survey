app.controller("MainCtrl", [
    function () {
        var vm = this;

        vm.survey = [
            {
                "title": "小家聚會",
                "items": [
                    {
                        "item": "小家聚會是否按5W進行",
                        "options": [
                            "1W或沒有",
                            "只做2W",
                            "只做3W",
                            "只做4W",
                            "完全按5W"
                        ]
                    },
                    {
                        "item": "小家聚會是否事先安排服事計劃表",
                        "options": [
                            "臨時安排",
                            "",
                            "每周安排",
                            "",
                            "每月安排"
                        ]
                    }
                ]
            },
            {
                "title": "小組架構",
                "items": [
                    {
                        "item": "是否有實習小組長人選",
                        "options": [
                            "沒有",
                            "",
                            "1位",
                            "",
                            "2位或以上"
                        ]
                    },
                    {
                        "item": "是否有核心同工",
                        "options": [
                            "沒有",
                            "1位",
                            "2位",
                            "",
                            "3位或以上"
                        ]
                    }
                ]
            }
        ];

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
                score += vm.answers[i].split(",")[2];
            }

            return score;
        };

        vm.isSelectedAnswer = function (categoryIndex, itemIndex, optionIndex) {
            var answer = categoryIndex + "," + itemIndex + "," + optionIndex;
            return vm.answers.indexOf(answer) >= 0;
        }
    }
]);