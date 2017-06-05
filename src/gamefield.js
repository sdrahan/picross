var lowfat = lowfat || {};

lowfat.Gamefield = function (scene, spriteManager) {
    var that = this;
    var container = scene;
    var board = null;
    var boardDimensions = null;

    var controls = null;

    var gridContainer = null;

    function initVars() {
        board = new lowfat.Board(4, 5, [0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1]);
        boardDimensions = new lowfat.BoardDimensions(board.getWidth(), board.getHeight(), cc.director.getWinSize());
    }

    function initLayers() {
        var bgGradient = new cc.LayerGradient(cc.color(161, 224, 229), cc.color(76, 161, 175));
        container.addChild(bgGradient);
        gridContainer = new cc.Node();
        container.addChild(gridContainer);
    }

    function initControls() {
        controls = new lowfat.TouchControls(scene, boardDimensions, selectCell);
        controls.init();
    }

    function drawBoard() {
        for (var row = 0; row < board.getHeight(); row++) {
            for (var col = 0; col < board.getWidth(); col++) {
                var gridCell = spriteManager.getSprite("GridCell");
                gridCell.setPosition(boardDimensions.cellToPointsX(col), boardDimensions.cellToPointsY(row));
                gridContainer.addChild(gridCell);

                // var cellContent = board.getIsFilled(col, row) ? spriteManager.getSprite("CellFilled") : spriteManager.getSprite("CellEmptySmall");
                // cellContent.setPosition(boardDimensions.cellToPointsX(col), boardDimensions.cellToPointsY(row));
                // gridContainer.addChild(cellContent);
            }
        }
    }

    this.start = function () {
        initVars();
        initLayers();
        initControls();
        drawBoard();
    };

    function selectCell(cellX, cellY) {
        if (board.getIsMarked(cellX, cellY)) {
            return;
        }

        board.mark(cellX, cellY);

        if (board.getIsFilled(cellX, cellY)) {
            revealFilledCell(cellX, cellY);
        } else {
            revealMistake(cellX, cellY);
            controls.forceStopDrag();
        }
    }

    function revealFilledCell(cellX, cellY) {
        var cellContent = spriteManager.getSprite("CellFilled");
        cellContent.setPosition(boardDimensions.cellToPointsX(cellX), boardDimensions.cellToPointsY(cellY));
        gridContainer.addChild(cellContent);

        var upScaleAction = new cc.ScaleTo(0.1, 1.1, 1.1).easing(cc.easeCubicActionOut());
        var waitAction = new cc.DelayTime(0.15);
        var scaleDownAction = new cc.ScaleTo(0.25, 1, 1).easing(cc.easeQuadraticActionOut());
        var sequence = new cc.Sequence(upScaleAction, waitAction, scaleDownAction);
        cellContent.runAction(sequence);
    }

    function revealMistake(cellX, cellY) {
        var cellContent = spriteManager.getSprite("CellMistake");
        cellContent.setPosition(boardDimensions.cellToPointsX(cellX), boardDimensions.cellToPointsY(cellY));
        gridContainer.addChild(cellContent);

        var upScaleAction = new cc.ScaleTo(0.1, 1.1, 1.1).easing(cc.easeCubicActionOut());
        var waitAction = new cc.DelayTime(0.15);
        var scaleDownAction = new cc.ScaleTo(0.25, 1, 1).easing(cc.easeQuadraticActionOut());
        var sequence = new cc.Sequence(upScaleAction, waitAction, scaleDownAction);
        cellContent.runAction(sequence);
    }

    this.onResize = function (screenSizeInPoints) {
        boardDimensions.resize(screenSizeInPoints);
    }
};

lowfat.TouchControls = function (scene, boardDimensions, selectCellCallback) {
    var touchStarted = false;

    this.init = function () {
        this.addListeners();
    };

    this.addListeners = function () {
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                processTouchStarted(touch.getLocation().x, touch.getLocation().y);
                return true;
            },
            onTouchMoved: function (touch, event) {
                processTouchUpdated(touch.getLocation().x, touch.getLocation().y, touch.getDelta())
            },
            onTouchEnded: function (touch, event) {
                processTouchEnded(touch.getLocation().x, touch.getLocation().y);
            }
        }, scene);
    };

    this.removeListeners = function () {
        cc.eventManager.removeListeners(cc.EventListener.TOUCH_ONE_BY_ONE);
    };

    this.forceStopDrag = function () {
        touchStarted = false;
    };

    function processTouchStarted(touchX, touchY) {
        if (!checkInsideBoard(touchX, touchY)) {
            return;
        }

        touchStarted = true;
        selectCellCallback(boardDimensions.pointsToCellX(touchX), boardDimensions.pointsToCellY(touchY));
    }

    function processTouchUpdated(touchX, touchY, delta) {
        if (!touchStarted || !checkInsideBoard(touchX, touchY)) {
            return;
        }

        selectCellCallback(boardDimensions.pointsToCellX(touchX), boardDimensions.pointsToCellY(touchY));
    }

    function processTouchEnded(touchX, touchY) {
        if (!touchStarted) {
            return;
        }

        touchStarted = false;
    }

    function checkInsideBoard(touchX, touchY) {
        return touchX > boardDimensions.getLeftX() && touchX < boardDimensions.getRightX() && touchY > boardDimensions.getBottomY() && touchY < boardDimensions.getTopY();
    }
};