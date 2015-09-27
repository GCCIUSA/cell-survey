export class API {
    constructor($firebase) {
        this.$firebase = $firebase;

        this.ref = new Firebase("https://gcci-cell-survey.firebaseio.com");
    }

    /**
     * retrieve a sinlge survey
     */
    get(surveyId) {
        return this.$firebase(this.ref.child(surveyId)).$asObject();
    }

    /**
     * retrieve all survey based on user permission
     */
    getAll() {

    }

    /**
     * update a single survey record
     */
    update(surveyId) {

    }
}

API.$inject = ["$firebase"];