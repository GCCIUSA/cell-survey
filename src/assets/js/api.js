export class API {
    constructor(fbUrl, $firebaseArray, $firebaseAuth, $state, $q, $http) {
        this.$state = $state;
        this.$q = $q;
        this.$http = $http;

        this.ref = new Firebase(fbUrl);
        this.fbArray = $firebaseArray(this.ref);
        this.fbAuth = $firebaseAuth(this.ref);
    }

    /**
     * get current authentication state
     */
    getAuth() {
        return this.fbAuth.$getAuth();
    }

    /**
     * populate Google login page
     */
    login(toState = void 0, toParams = {}) {
        let options = {
            "scope": ["https://www.googleapis.com/auth/userinfo.email"].join(" "),
            "hd": "thegcci.org"
        };
        this.fbAuth.$authWithOAuthPopup("google", options).then(() => {
            if (toState) { this.$state.go(toState, toParams); }
        }).catch(() => {
            alert("User Login Failed");
        });
    }

    /**
     * destroy current authentication state
     */
    logout() {
        return this.fbAuth.$unauth();
    }

    /**
     * retrieve a survey record by user's email
     */
    getSurveyByUser(uid) {
        let deferred = this.$q.defer();
        this.ref.orderByChild("uid").equalTo(uid).once("value", (snapshot) => {
            deferred.resolve(snapshot.val());

            // cancel event callback
            this.ref.off("value");
        });

        return deferred.promise;
    }

    /**
     * submit a survey record
     */
    submitSurvey(uid, answers) {
        this.fbArray.$add({
            "uid": uid,
            "add_date": new Date().getTime(),
            "answers": answers
        }).then((ref) => {
            let id = ref.key();
            console.log("record added: " + id);
        });
    }

    getCurrentForm() {
        let deferred = this.$q.defer();

        let surveyConfig = this.$http.get("survey.json"),
            surveyForms = this.$http.get("forms.json");

        this.$q.all([surveyConfig, surveyForms]).then((response) => {
            let currentSurvey = response[0].data[0],
                today = new Date().getTime(),
                openFrom = new Date(currentSurvey.openPeriod[0]).getTime(),
                openUntil = new Date(currentSurvey.openPeriod[1]).getTime();

            if (today >= openFrom && today <= openUntil) {
                let data = response[1].data.find(form => form.ver === currentSurvey.formVer);
                data.statsPeriod = currentSurvey.statsPeriod;
                data.openPeriod = currentSurvey.openPeriod;

                deferred.resolve(data);
            }
            else {
                deferred.reject();
            }
        });

        return deferred.promise;
    }
}

API.$inject = ["fbUrl", "$firebaseArray", "$firebaseAuth", "$state", "$q", "$http"];