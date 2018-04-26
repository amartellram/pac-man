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
                this.movePacman('up');
            },
            down: function(){
                this.movePacman('down');
            },
            left: function(){
                this.movePacman('left');
            },
            right: function(){
                this.movePacman('right');
            },
        };
    },
    didInsertElement: function(){
        this.drawGrid();
        this.drawPac();
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
    drawPellet(x, y){
        let radiusDivisor = 6;
        this.drawCircle(x, y, radiusDivisor);


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

        this.drawCircle(x, y, radiusDivisor);
    },
    drawCircle: function(x, y, radiusDivisor){
        let ctx = this.get('ctx');
        let squareSize = this.get('squareSize');

        let pixelX = (x + 1/2) * squareSize;
        let pixelY = (y + 1/2) * squareSize;

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, squareSize/radiusDivisor, 0, Math.PI*2, false);
        ctx.closePath();
        ctx.fill();
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
        return this.get(coordinate) + this.get('directions.${direction}.${coordinate}');
    },
    pathBlockedInDirection: function(direction){
        let cellTypeInDirection = this.cellTypeInDirection(direction);
        console.log(cellTypeInDirection);
        return Ember.isEmpty(cellTypeInDirection) || cellTypeInDirection == 1;
    },
    cellTypeInDirection: function(direction){
        let nextX = this.nextCoordinate('x', direction);
        let nextY = this.nextCoordinate('y', direction);

        return this.get('grid.${nextY}.${nextX}')
    },
    movePacman: function(direction){
        
        if(!this.pathBlockedInDirection(direction)){
            this.set('x', this.nextCoordinate('x', direction));
            this.set('y', this.nextCoordinate('y', direction));
        }

        this.processAnyPellets();


        this.clearScreen();
        this.drawGrid();
        this.drawPac();
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



