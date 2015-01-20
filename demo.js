/* global document, window */
window.requestAnimationFrame(function loop() {
    [].forEach.call(document.querySelectorAll('div'), function (el) {
        el.style.padding = '2px';
        el.style.outline = '1px red solid';
    });
    window.requestAnimationFrame(loop);
});

var mixin = require('./mixin');
var View = require('ampersand-view').extend(mixin);

var Subview = View.extend(mixin, {
    template: function () {
        return '<div><h2>hi from subview ' + this.number + '!</h2></div>';
    },
    props: {
        number: 'number'
    },
    initialize: function () {
        this.on('change:number', this.render.bind(this));
    }
});

var OtherSubview = View.extend({
    template: '<div><h2>hi from a different subview!</h2></div>'
});

var View = View.extend({
    template: function () {
        if (this.number > 5 && this.number < 10) {
            return '<div><h1>Hi!</h1>';
        }

        if (this.number < 15) {
            return [
                '<div>',
                '  <h1>Hello! ' + this.number + '</h1>',
                '  <div data-hook="subview">S</div>',
                '</div>'
            ].join('');
        } else {
            return [
                '<div>',
                '  <h1>Hello! ' + this.number + '</h1>',
                '  <div data-hook="other-subview">O</div>',
                '</div>'
            ].join('');
        }
    },
    props: {
        number: 'number',
        time: 'number'
    },
    initialize: function () {
        this.on('change:number', this.render.bind(this));
        setInterval(function () {
            this.time = Date.now();
        }.bind(this), 100);
    },
    subviews: {
        sub: {
            constructor: Subview,
            hook: 'subview',
            prepareView: function () {
                var parentView = this;

                var view = new Subview({
                    number: parentView.time,
                    parent: parentView
                });

                view.listenTo(parentView, 'change:time', function () {
                    view.number = parentView.time;
                });

                return view;
            }
        },
        otherSub: {
            constructor: OtherSubview,
            hook: 'other-subview'
        }
    }
});

var view = new View({ number: 1 });
view.render();
document.body.appendChild(view.el);

setInterval(function () {
    view.number++;
}, 1000);
