import { computed } from '@ember/object';
import Component from '@ember/component';
import KeyboardShortCuts from 'ember-keyboard-shortcuts/mixins/component';
import embeddedRecordsMixin from 'ember-data/serializers/embedded-records-mixin';

export default Component.extend(KeyboardShortCuts, {
    levelNumber : 1,
    score: 0,
    x: 1,
    y: 2,
    squareSize: 40,
    isMoving: false,
    direction: 'down',
    intent: 'down',
    screenWidth: computed(function(){
        return this.get('grid.firstObject.length');
    }),
    screenHeight: computed(function(){
        return this.get('grid.length');
    }),
    init(){
        this._super(...arguments);
        this.grid = [
            [2, 2, 2, 2, 2, 2, 2, 1],
            [2, 1, 2, 1, 2, 2, 2, 1],
            [2, 2, 1, 2, 2, 2, 2, 1],
            [2, 2, 2, 2, 2, 2, 2, 1],
            [2, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
        ];
        this.directions = {
            'up': {x:0, y:-1},
            'down': {x:0, y:1},
            'left': {x:-1, y:0},
            'right': {x:1, y:0},
            'stopped': {x:0, y:0} 
        };
        this.keyboardShortcuts = {
            up: function(){
                console.log('up');
                this.set('intent','up');
            },
            down: function(){
                console.log('down');
                this.set('intent','down');
            },
            left: function(){
                console.log('left');
                this.set('intent','left');
            },
            right: function(){
                console.log('right');
                this.set('intent','right');
            },
        };
    },
    didInsertElement: function(){
        this.movementLoop();
    },
    ctx: computed(function(){
        let canvas = document.getElementById("myCanvas");
        let ctx = canvas.getContext("2d");
        return ctx;
    }),
    drawWall: function(x, y){
        let ctx = this.get('ctx');
        let squareSize = this.get('squareSize');
        ctx.fillStyle = "#000";
        ctx.fillRect(
            x * squareSize,
            y * squareSize,
            squareSize,
            squareSize
        );
    },
    drawPellet: function(x, y){
        let radiusDivisor = 6;
        this.drawCircle(x, y, radiusDivisor, 'stopped');


    },
    drawGrid: function(){
        let grid = this.get('grid');
        grid.forEach((row, rowIndex)=>{
            row.forEach((cell, columnIndex)=> {
                if(cell == 1){
                    this.drawWall(columnIndex, rowIndex);
                }
                if(cell == 2){                    
                    this.drawPellet(columnIndex, rowIndex);
                }
            });
        });
        
    },
    drawPac: function() {        
        let x = this.get('x');
        let y = this.get('y');
        let radiusDivisor = 2;

        this.drawCircle(x, y, radiusDivisor, this.get('direction'));
    },
    drawCircle: function(x, y, radiusDivisor, direction){
        let ctx = this.get('ctx');
        let squareSize = this.get('squareSize');

        let pixelX = (x + 1/2 + this.offsetFor('x', direction)) * squareSize;
        let pixelY = (y + 1/2 + this.offsetFor('y', direction)) * squareSize;

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, squareSize/radiusDivisor, 0, Math.PI*2, false);
        ctx.closePath();
        ctx.fill();
    },
    offsetFor : function(coordinate, direction){
        let frameRatio = this.get('frameCycle') / this.get('framesPerMovement');
        return this.get('directions')[direction][coordinate]* frameRatio;
    }, 
    screenPixelWidth: computed(function(){
        return this.get('screenWidth') * this.get('squareSize');
    }),
    screenPixelHeight: computed(function() {
        return this.get('screenHeight') * this.get('squareSize');
    }),
    clearScreen: function(){
        let ctx = this.get('ctx');
        ctx.clearRect(0, 0, this.get('screenPixelWidth'), this.get('screenPixelHeight'));
    },    
    collidedWithBorder: function(){
        let x = this.get('x');
        let y = this.get('y');
        let screenHeight = this.get('screenHeight');
        let screenWidth = this.get('screenWidth');        

        let pacOutOfBounds = (x < 0 ||  y < 0 || x >= screenWidth ||  y >= screenHeight);
    
        return pacOutOfBounds;
    },
    collideWithWall: function(){
        let x = this.get('x');
        let y = this.get('y');
        let grid = this.get('grid');

        return grid[y][x] == 1;
    },
    processAnyPellets: function(){
        let x = this.get('x');
        let y = this.get('y');
        let grid = this.get('grid');
        if(grid[y][x] == 2){
            grid[y][x] = 0;
            this.incrementProperty('score');

            if(this.levelComplete()){
                this.incrementProperty('levelNumber');
                this.restartLevel();
            }
        }
    },
    nextCoordinate: function(coordinate, direction){
        return this.get(coordinate) + this.get('directions')[direction][coordinate];
    },
    pathBlockedInDirection: function(direction){
        let cellTypeInDirection = this.cellTypeInDirection(direction);
        return Ember.isEmpty(cellTypeInDirection) || cellTypeInDirection == 1;
    },
    cellTypeInDirection: function(direction){
        let nextX = this.nextCoordinate('x', direction);
        let nextY = this.nextCoordinate('y', direction);

        return this.get('grid')[nextY][nextX];
    },
    frameCycle: 1,
    framesPerMovement: 30,
    movementLoop: function(){
        if(this.get('frameCycle') == this.get('framesPerMovement')){
            let direction = this.get('direction')
            this.set('x', this.nextCoordinate('x', direction));
            this.set('y', this.nextCoordinate('y', direction));
            
            this.set('frameCycle', 1);
            this.processAnyPellets();
            this.changePacDirection();
        } else if(this.get('direction') == 'stopped'){
            this.changePacDirection();
        } else {
            this.incrementProperty('frameCycle');
        }

            this.clearScreen();
            this.drawGrid();
            this.drawPac();

            Ember.run.later(this, this.movementLoop, 1000/60);
    },
    changePacDirection(){
        let intent = this.get('intent');
        if(this.pathBlockedInDirection(intent)){
            this.set('direction', 'stopped');
        } else {
            this.set('direction', intent);
        }
    },
    levelComplete: function(){
        let hasPelletsLeft = false;
        let grid = this.get('grid');

        grid.forEach((row)=>{
            row.forEach((cell)=>{
                if(cell ==2){
                    hasPelletsLeft = true;
                }

            });
        });
        return !hasPelletsLeft;
    },
    restartLevel: function(){
        this.set('x', 0);
        this.set('y', 0);

        let grid = this.get('grid');
    grid.forEach((row, rowIndex)=>{
        row.forEach((cell, columnIndex)=>{
            if(cell == 0){
                grid[rowIndex][columnIndex] = 2;
            }
        });
    });
    }
});



