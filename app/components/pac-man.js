import EmberObject, { computed } from '@ember/object';
import Component from '@ember/component';
import KeyboardShortCuts from 'ember-keyboard-shortcuts/mixins/component';

export default Component.extend(KeyboardShortCuts, {
    x: 1,
    y: 2,
    squareSize: 40,
    ctx: computed(function(){
        let canvas = document.getElementById("myCanvas");
        let ctx = canvas.getContext("2d");
        return ctx;
    }),
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
    screenWidth: 20,
    screenHeight: 15,
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
    movePacman: function(direction, amount){
        this.incrementProperty(direction, amount);

        if(this.collidedWithBorder()){
            this.decrementProperty(direction, amount);
        }
        this.clearScreen();
        this.drawCircle();
    },
    collidedWithBorder: function(){
        let x = this.get('x');
        let y = this.get('y');
        let screenHeight = this.get('screenHeight');
        let screenWidth = this.get('screenWidth');        

        let pacOutOfBounds = (x < 0 ||  y < 0 || x >= screenWidth ||  y >= screenHeight);
    
        return pacOutOfBounds;
},
    keyboardShortcuts: {
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
    },
});



