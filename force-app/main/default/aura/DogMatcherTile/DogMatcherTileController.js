({
    requestTileFlip : function(component, event, helper) {
        helper.requestTileFlip(component);
    },

    flipTile : function(component, event, helper) {
        let params = event.getParam('arguments');
        helper.setRevealedState(component, params.isRevealed || false);
    },

    setTileMatchState : function(component, event, helper) {
        let params = event.getParam('arguments');
        component.set(params.isMatch ? 'v.isMatched' : 'v.isMismatched', true);
        if (params.isMatch === false) {
            window.setTimeout($A.getCallback(() => {
                component.set('v.isMismatched', false);
            }), params.tileRevealDuration * 1000);
        }
    },
})