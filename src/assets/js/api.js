export class API {
    constructor(fbUrl, $firebaseArray, $firebaseAuth, $state) {
        this.$state = $state;

        let ref = new Firebase(fbUrl);
        this.fbArray = $firebaseArray(ref);
        this.fbAuth = $firebaseAuth(ref);
    }

    getAuth() {
        return this.fbAuth.$getAuth();
    }

    login(toState = void 0, toParams = {}) {
        this.fbAuth.$authWithOAuthPopup("google", {"hd": "thegcci.org"}).then(() => {
            if (toState) { this.$state.go(toState, toParams); }
        }).catch(() => {
            alert("User Login Failed");
        });
    }

    logout() {
        return this.fbAuth.$unauth();
    }

    /**
     * submit a survey answers
     */
    submitSurvey(answers) {
        this.fbArray.$add({
            "user": "peter.zhang@thegcci.org",
            "answers": answers
        }).then((ref) => {
            let id = ref.key();
            console.log("record added: " + id);
            console.log(this.fbArray.$indexFor(id));
        });

    }
}

API.$inject = ["fbUrl", "$firebaseArray", "$firebaseAuth", "$state"];