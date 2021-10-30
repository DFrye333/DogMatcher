({
    init : function(component, event, helper) {
        helper.fetchCurrentPlayerHighScore(component)
        .then($A.getCallback(highScore => {
            component.set('v.playerHighScore', highScore);
        })).catch($A.getCallback(error => {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "type" : "error",
                "title" : "Error fetching high score",
                "message" : error.message
            });
            toastEvent.fire();
        }));
    },

    handleLogEvent : function(component, event, helper) {
        helper.log(component, event.getParams('arguments'));
    },

    handleTileFlippedEvent : function(component, event, helper) {
        if ($A.util.isUndefinedOrNull(component.get('v.startPlayTime'))) {
            component.set('v.startPlayTime', Date.now());
            helper.runPlayTimer(component);
        }
    },

    handleBoardResetEvent : function(component, event, helper) {
        helper.resetStats(component);
    },

    handlePairRevealedEvent : function(component, event, helper) {
        let params = event.getParams('arguments');

        let matchStreak = component.get('v.matchStreak');
        // The current turn yielded a matching tile pair.
        if (params.isMatch) {
            // The player is on a matching streak. Track this occurrence for scoring calculation.
            if (matchStreak > 0) {
                component.set('v.totalMatchStreakMultiplier', component.get('v.totalMatchStreakMultiplier') + matchStreak);
            }

            component.set('v.matchStreak', ++matchStreak);

            // The player has broken the impressive streak threshold.
            if (matchStreak >= 4) {
                component.set('v.obtainedImpressiveMatchStreak', true);
            }

            component.set('v.matchesHit', component.get('v.matchesHit') + 1);
        // The current turn yielded a mismatched tile pair.
        } else {
            component.set('v.matchStreak', 0);
            component.set('v.matchesMissed', component.get('v.matchesMissed') + 1);
        }
    },

    handleGameOverEvent : function(component, event, helper) {
        window.clearTimeout(component.get('v.playTimerId'));

        let winMessage = "You won Dog Matcher!";
        if (component.get('v.matchesMissed') === 0) {
            component.set('v.obtainedPerfection', true);

            winMessage = "Perfection! You're a Dog Matcher master!"
        }

        helper.calculateScore(component);

        let playerCurrentScore = component.get('v.playerCurrentScore');
        if (playerCurrentScore > component.get('v.playerHighScore')) {
            helper.updateCurrentPlayerHighScore(component, playerCurrentScore)
            .then($A.getCallback(() => {
                component.set('v.playerHighScore', playerCurrentScore);
            })).catch($A.getCallback(error => {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "type" : "error",
                    "title" : "Error updating high score",
                    "message" : error.message
                });
                toastEvent.fire();
            }));
        }

        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "type" : "success",
            "title" : "Congratulations!",
            "message" : winMessage
        });
        toastEvent.fire();
    },

    handleNewGameButtonClick: function(component, event, helper) {
        helper.resetStats(component);
        component.find('dog-matcher-board').resetBoard();
    },

    handleDevModeButtonClick: function(component, event, helper) {
        helper.toggleDeveloperMode(component);
    },
})