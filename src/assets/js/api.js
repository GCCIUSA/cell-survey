export class API {
    constructor(fbUrl, $firebaseArray, $firebaseAuth, $state, $q) {
        this.$state = $state;
        this.$q = $q;

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
        this.ref.orderByChild("uid").equalTo(uid).on("value", (snapshot) => {
            // TODO added logic to get one record instead of all records
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
}

API.$inject = ["fbUrl", "$firebaseArray", "$firebaseAuth", "$state", "$q"];