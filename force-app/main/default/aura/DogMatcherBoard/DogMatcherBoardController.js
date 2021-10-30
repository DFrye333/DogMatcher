({
    init : function(component, event, helper) {
        helper.doInit(component);
    },

    handleTileFlippedEvent : function(component, event, helper) {
        let numberOfTilesRevealed = component.get('v.numberOfTilesRevealed');
        if (numberOfTilesRevealed >= 2) {
            return;
        }

        let params = event.getParams('arguments');
        
        component.find('tile')[params.tileIndex].flipTile(params.isRevealed);
        component.set('v.numberOfTilesRevealed', ++numberOfTilesRevealed);

        let flippedTileIndex = component.get('v.flippedTileIndex');
        if ($A.util.isUndefinedOrNull(flippedTileIndex)) {
            helper.setFlippedTile(component, params.tileIndex, params.imageUrl);
            return;
        }

        helper.checkForTileMatch(component, params);
    },

    getTileQuantity : function(component, event, helper) {
        return component.get('v.tileQuantity');
    },

    tileDensityFactorChanged : function(component, event, helper) {
        helper.validateTileDensityFactor(component);
        helper.resetBoard(component);
    },

    tileRevealDurationChanged : function(component, event, helper) {
        helper.validateTileRevealDuration(component);
    },

    resetBoard : function(component, event, helper) {
        helper.resetBoard(component);
    },
})