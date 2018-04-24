import Component from '@ember/component';
import KeyboardShortCuts from 'ember-keyboard-shortcuts/mixins/component';

export default Component.extend(KeyboardShortCuts, {
    x: 50,
    y: 100,
    squareSize: 40,
    ctx: Ember.computed(function(){
        let canvas = document.getElementById("myCanvas");
        let ctx = canvas.getContext("2d");
        return ctx;
    }),
    drawCircle: function() {        
        let ctx = this.get('ctx');
        let x = this.get('x');
        let y = this.get('y');
        let radius = this.get('squareSize')/2;
       
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    },
    clearScreen: function(){
        let ctx = this.get('ctx');
        let screenWidth = 800;
        let screenHeight = 600;

        ctx.clearRect(0, 0, screenWidth, screenHeight);
    },
    movePacman: function(direction, amount){
        this.incrementProperty(direction, amount);
        this.clearScreen();
        this.drawCircle();
    },
    keyboardShortcuts: {
        up: function(){
            this.movePacman('y', -1*this.get('squareSize'));
        },
        down: function(){
            this.movePacman('y', this.get('squareSize'));
        },
        left: function(){
            this.movePacman('x', -1 * this.get('squareSize'));
        },
        right: function(){
            this.movePacman('x', this.get('squareSize'));
        },
    },
});



