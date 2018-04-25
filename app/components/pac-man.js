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
            [0, 0, 0, 0, 0, 0, 0, 1],
            [0, 1, 0, 1, 0, 0, 0, 1],
            [0, 0, 1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
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
        this.drawWalls();
        this.drawCircle();
    },
    ctx: computed(function(){
        let canvas = document.getElementById("myCanvas");
        let ctx = canvas.getContext("2d");
        return ctx;
    }),
    drawWalls: function(){
        let squareSize = this.get('squareSize');
        let ctx = this.get('ctx');
        ctx.fillStyle = "#000";

        let grid = this.get('grid');
        grid.forEach(function(row, rowIndex){
            row.forEach(function(cell, columnIndex) {
                if(cell == 1){
                    ctx.fillRect(columnIndex * squareSize,
                                rowIndex * squareSize,
                                squareSize,
                                squareSize);
                }
            });
        });
        
    },
    drawCircle: function() {        
        let ctx = this.get('ctx');
        let x = this.get('x');
        let y = this.get('y');
        let squareSize = this.get('squareSize');
        
        let pixelX = (x+1/2) * squareSize;
        let pixelY = (y+1/2) * squareSize;
       
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(pixelX,pixelY, squareSize/2, 0, Math.PI * 2, false);
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
    movePacman: function(direction, amount){
        this.incrementProperty(direction, amount);

        if(this.collidedWithBorder() || this.collideWithWall()){
            this.decrementProperty(direction, amount);
        }
        this.clearScreen();
        this.drawWalls();
        this.drawCircle();
    },
});



