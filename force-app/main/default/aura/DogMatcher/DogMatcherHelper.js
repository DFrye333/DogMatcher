({
    runPlayTimer : function(component) {
        // Runs the game timer and recalculates the player's current score.
        component.set('v.playTimerId', window.setTimeout($A.getCallback(() => {
            let updatedElapsedPlayTime = Math.floor((Date.now() - component.get('v.startPlayTime')) / 1000);
            component.set('v.elapsedPlayTime', updatedElapsedPlayTime);

            window.setTimeout($A.getCallback(() => { this.calculateScore(component); }), 1);

            this.runPlayTimer(component);
        }), 100));
    },

    calculateScore : function(component) {
        // The base score for simply matching a pair of tiles.
        let baseScore = (component.get('v.baseMatchValue') * component.get('v.matchesHit')) - component.get('v.matchesMissed');

        // The time-based bonus score for fast wins.
        let timeBonus = Math.max((5 * component.find('dog-matcher-board').getTileQuantity()) - component.get('v.elapsedPlayTime'), 0);

        // The streak bonus for unbroken runs of tile matches.
        let streakBonus = component.get('v.baseMatchValue') * component.get('v.totalMatchStreakMultiplier');

        // The impressive streak bonus, for long streaks.
        let impressiveStreakBonus = component.get('v.obtainedImpressiveMatchStreak') ? 50 : 0;

        // The perfection bonus, for an epic game won without a single mismatch.
        let perfectionBonus = component.get('v.obtainedPerfection') ? Math.pow(7, component.get('v.tileDensityFactor')) : 0;

        // The final score is a sum of the above scoring elements.
        component.set('v.playerCurrentScore', baseScore + timeBonus + streakBonus + impressiveStreakBonus + perfectionBonus);
    },

    fetchCurrentPlayerHighScore : function(component) {
        return new Promise($A.getCallback((resolve, reject) => {
            let action = component.get('c.getCurrentPlayerHighScore');
            action.setCallback(this, (response) => {
                let state = response.getState();
                if (state === "SUCCESS") {
                    resolve(response.getReturnValue());
                } else {
                    let errors = response.getError();
                    let errorMessage = errors[0] && errors[0].message ? errors[0].message : "Error fetching current player's high score!";
                    reject(new Error(errorMessage));   
                }
            });
            $A.enqueueAction(action);
        }));
    },

    updateCurrentPlayerHighScore : function(component, playerNewHighScore) {
        return new Promise($A.getCallback((resolve, reject) => {
            let action = component.get('c.setCurrentPlayerHighScore');
            action.setParams({
                "highScore" : playerNewHighScore
            });
            action.setCallback(this, (response) => {
                let state = response.getState();
                if (state === "SUCCESS") {
                    resolve();
                } else {
                    let errors = response.getError();
                    let errorMessage = errors[0] && errors[0].message ? errors[0].message : "Error updating current player's high score!";
                    reject(new Error(errorMessage));   
                }
            });
            $A.enqueueAction(action);
        }));
    },

    resetStats : function(component) {
        window.clearTimeout(component.get('v.playTimerId'));
        component.set('v.startPlayTime', null);
        component.set('v.elapsedPlayTime', 0);
        component.set('v.playerCurrentScore', 0);
        component.set('v.matchesHit', 0);
        component.set('v.matchesMissed', 0);
        component.set('v.matchStreak', 0);
        component.set('v.totalMatchStreakMultiplier', 0);
        component.set('v.obtainedImpressiveMatchStreak', false);
        component.set('v.obtainedPerfection', false);
    },

    toggleDeveloperMode : function(component) {
        component.set('v.isDeveloperModeEnabled', !component.get('v.isDeveloperModeEnabled'));
    },

    log : function(component, log) {
        if (log.isDeveloperLog && !component.get('v.isDeveloperModeEnabled')) {
            return;
        }

        if (log.type === 'object') {
            log.message = JSON.parse(log.message);
        }

        console.log(log.message);
    },
})