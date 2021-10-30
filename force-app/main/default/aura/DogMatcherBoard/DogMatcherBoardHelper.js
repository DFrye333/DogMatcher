({
    doInit : function(component) {
        this.fetchDogs(component)
        .then($A.getCallback(dogs => {
            component.set('v.boardWidth', this.calculateBoardWidth(component, component.get('v.tileDensityFactor')));
            this.createBoard(component, JSON.parse(dogs));

            component.set('v.isBoardLoaded', true);
        })).catch($A.getCallback(error => {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "type" : "error",
                "title" : "Error fetching dogs",
                "message" : error.message
            });
            toastEvent.fire();
        }));
    },

    fetchDogs : function(component) {
        return new Promise($A.getCallback((resolve, reject) => {
            let dogQuantity = this.calculateTileQuantity(component, component.get('v.tileDensityFactor'));

            let action = component.get('c.getDogs');
            action.setParams({
                quantity : dogQuantity
            });
            action.setCallback(this, (response) => {
                let state = response.getState();
                if (state === "SUCCESS") {
                    resolve(response.getReturnValue());
                } else {
                    let errors = response.getError();
                    let errorMessage = errors[0] && errors[0].message ? errors[0].message : "Error fetching random dogs!";
                    reject(new Error(errorMessage));   
                }
            });
            $A.enqueueAction(action);
        }));
    },

    createBoard : function(component, dogs) {
        dogs = dogs.concat(dogs);

        let scrambledDogs = [];
        while (dogs.length > 0) {
            scrambledDogs = scrambledDogs.concat(dogs.splice(Math.floor(Math.random() * dogs.length), 1));
        }

        component.set('v.dogs', scrambledDogs);
        component.set('v.tileQuantity', scrambledDogs.length);

        this.log(component, JSON.stringify(scrambledDogs), typeof scrambledDogs, true);
    },

    calculateTileQuantity : function(component, tileDensityFactor) {
        // Dog_Quantity = ((2 * Tile_Density_Factor)^2) / 2
        // This allows us to specify a relatively large and valid game board (one with an even number of tiles)
        // with a single one-digit number.

        // If tile density were to be >3, we might try to request more dog photos at once than the API supports.
        let dogQuantity = Math.min(tileDensityFactor, 3);
        // Multiply by 2 to guarantee an even number of tiles, then square to fill a large game board.
        dogQuantity = Math.pow(dogQuantity * 2, 2);
        // Divide by two, since we want half as many dogs as we have tiles.
        dogQuantity = Math.ceil(dogQuantity / 2);

        return dogQuantity;
    },

    calculateBoardWidth : function(component, tileDensity) {
        const TILE_WIDTH = 150;
        const TILE_MARGIN = 10;

        // The board should be just wide enough to snugly fit (2 * tile_density) tiles and their left and right margins.
        return (2 * tileDensity * TILE_WIDTH) + (4 * tileDensity * TILE_MARGIN);
    },

    checkForTileMatch : function(component, latestFlippedTile) {
        let tiles = component.find('tile');
        let flippedTileIndex = component.get('v.flippedTileIndex');
    
        // If two different tiles have the same image URL, they are considered to be a matching pair.
        let flippedMatch = (component.get('v.flippedTileIndex') !== latestFlippedTile.tileIndex)
                        && (component.get('v.flippedTileImageUrl') === latestFlippedTile.imageUrl);

        let pairRevealedEvent = component.getEvent('pairRevealedEvent');
        pairRevealedEvent.setParams({
            "isMatch" : flippedMatch
        });
        pairRevealedEvent.fire();

        // If the tiles match, mark them as matches and reset the turn state in preparation for the next turn.
        if (flippedMatch) {
            tiles[flippedTileIndex].setTileMatchState(true);
            tiles[latestFlippedTile.tileIndex].setTileMatchState(true);

            this.resetFlippedTile(component);
            component.set('v.tilesMatchedQuantity', component.get('v.tilesMatchedQuantity') + 2 || 2);

            this.checkForGameOver(component);
        // If the tiles don't match, mark them as mismatches and reset them, also resetting the turn state.
        } else {
            let tileRevealDuration = component.get('v.tileRevealDuration');

            // Mark the tiles as mismatches.
            tiles[flippedTileIndex].setTileMatchState(false, tileRevealDuration);
            tiles[latestFlippedTile.tileIndex].setTileMatchState(false, tileRevealDuration);

            // On a configurable delay, flip the tiles back over.
            window.setTimeout($A.getCallback(() => {
                if (!$A.util.isUndefinedOrNull(flippedTileIndex)) {
                    tiles[flippedTileIndex].flipTile(false);
                    tiles[latestFlippedTile.tileIndex].flipTile(false);

                    this.resetFlippedTile(component);
                } else {
                    this.setFlippedTile(component, latestFlippedTile.tileIndex, latestFlippedTile.imageUrl);
                }
            }), tileRevealDuration * 1000);
        }
    },

    setFlippedTile : function(component, flippedTileIndex, flippedTileImageUrl) {
        component.set('v.flippedTileIndex', flippedTileIndex);
        component.set('v.flippedTileImageUrl', flippedTileImageUrl);
    },

    resetFlippedTile : function(component) {
        component.set('v.numberOfTilesRevealed', 0);
        component.set('v.flippedTileIndex', null);
        component.set('v.flippedTileImageUrl', null);
    },

    checkForGameOver : function(component) {
        // If all tiles have been matched, the game is over.
        if (component.get('v.tileQuantity') === component.get('v.tilesMatchedQuantity')) {
            component.getEvent('gameOverEvent').fire();
        }
    },

    resetBoard : function(component) {
        window.clearTimeout(component.get('v.boardResetTimerId'));

        // Delay resetting of the board state to mitigate spam-fire of server and external API calls.
        let boardResetTimerId = window.setTimeout($A.getCallback(() => {
            this.doInit(component);
            this.resetFlippedTile(component);
            component.set('v.tilesMatchedQuantity');

            component.getEvent('boardResetEvent').fire();
        }), 500);

        component.set('v.boardResetTimerId', boardResetTimerId);
    },

    validateTileDensityFactor : function(component) {
        let tileDensityFactor = component.get('v.tileDensityFactor');

        // Clamp the tile density factor within the valid range.
        const MIN_SUPPORTED_TILE_DENSITY_FACTOR = 1;
        const MAX_SUPPORTED_TILE_DENSITY_FACTOR = 3;
        if (tileDensityFactor < MIN_SUPPORTED_TILE_DENSITY_FACTOR) {
            tileDensityFactor = MIN_SUPPORTED_TILE_DENSITY_FACTOR;
        } else if (tileDensityFactor > MAX_SUPPORTED_TILE_DENSITY_FACTOR) {
            tileDensityFactor = MAX_SUPPORTED_TILE_DENSITY_FACTOR;
        }

        component.set('v.tileDensityFactor', tileDensityFactor);

        return tileDensityFactor;
    },

    validateTileRevealDuration : function(component) {
        let tileRevealDuration = component.get('v.tileRevealDuration');

        // Clamp the tile reveal duration within the valid range.
        const MIN_SUPPORTED_TILE_REVEAL_DURATION = 1;
        const MAX_SUPPORTED_TILE_REVEAL_DURATION = 10;
        if (tileRevealDuration < MIN_SUPPORTED_TILE_REVEAL_DURATION) {
            tileRevealDuration = MIN_SUPPORTED_TILE_REVEAL_DURATION;
        } else if (tileRevealDuration > MAX_SUPPORTED_TILE_REVEAL_DURATION) {
            tileRevealDuration = MAX_SUPPORTED_TILE_REVEAL_DURATION;
        }

        component.set('v.tileRevealDuration', tileRevealDuration);

        return tileRevealDuration;
    },

    log : function(component, message, type, isDeveloperLog) {
        component.getEvent('logEvent')
        .setParams({
            'message' : message,
            'type' : type || 'string',
            'isDeveloperLog' : isDeveloperLog || true
        })
        .fire();
    },
})