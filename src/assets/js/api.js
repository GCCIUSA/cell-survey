export class API {
    constructor(fbUrl, $firebaseArray, $firebaseAuth, $state) {
        this.$state = $state;

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
     * retrieve survey answers by user's email
     */
    getAnswersByUser(userEmail) {
        let data = [];
        this.ref.orderByChild("user_email").equalTo(userEmail).on("child_added", (snapshot) => {
            data.push(snapshot.val());
        });
        return data;
    }

    /**
     * submit a survey answers
     */
    submitAnswers(userEmail, answers) {
        this.fbArray.$add({
            "user_email": userEmail,
            "add_date": new Date().getTime(),
            "answers": answers
        }).then((ref) => {
            let id = ref.key();
            console.log("record added: " + id);
        });

    }
}

API.$inject = ["fbUrl", "$firebaseArray", "$firebaseAuth", "$state"];