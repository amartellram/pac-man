import { computed } from '@ember/object';
import Component from '@ember/component';
import KeyboardShortCuts from 'ember-keyboard-shortcuts/mixins/component';

export default Component.extend(KeyboardShortCuts, {
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
        this.keyboardShortcuts = {
            up: function(){
                this.movePacman('y', -1);
            },
            down: function(){
                this.movePacman('y',1);
            },
            left: function(){
                this.movePacman('x', -1);
            },
            right: function(){
                this.movePacman('x',1);
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
        }
    },
    movePacman: function(direction, amount){
        this.incrementProperty(direction, amount);

        if(this.collidedWithBorder() || this.collideWithWall()){
            this.decrementProperty(direction, amount);
        }

        this.processAnyPellets();


        this.clearScreen();
        this.drawGrid();
        this.drawPac();
    },
});



