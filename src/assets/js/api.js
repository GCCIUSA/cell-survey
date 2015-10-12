export class API {
    constructor(fbUrl, $firebaseArray, $firebaseAuth, $state) {
        this.$state = $state;

        let ref = new Firebase(fbUrl);
        this.fbArray = $firebaseArray(ref);
        this.fbAuth = $firebaseAuth(ref);
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
     * submit a survey answers
     */
    submitSurvey(userEmail, answers) {
        this.fbArray.$add({
            "user_email": userEmail,
            "add_date": new Date().getTime(),
            "answers": answers
        }).then((ref) => {
            let id = ref.key();
            console.log("record added: " + id);
            console.log(this.fbArray.$indexFor(id));
        });

    }
}

API.$inject = ["fbUrl", "$firebaseArray", "$firebaseAuth", "$state"];