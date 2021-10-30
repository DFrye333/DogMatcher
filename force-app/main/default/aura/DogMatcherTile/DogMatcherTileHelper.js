({
    requestTileFlip : function(component) {
        if (component.get('v.isRevealed') || component.get('v.isMatched')) {
            return;
        }

        let tileFlippedEvent = component.getEvent('tileFlippedEvent');
        tileFlippedEvent.setParams({
            "tileIndex" : component.get('v.tileIndex'),
            "imageUrl" : component.get('v.imageUrl'),
            "isRevealed" : !component.get('v.isRevealed')
        });
        tileFlippedEvent.fire();
    },

    setRevealedState : function(component, newState) {
        component.set('v.isRevealed', newState);
    },

    toggleRevealedState : function(component) {
        this.requestTileFlip(!component.get('v.isRevealed'));
    },
})