/* global document */

var test = require('tape');

var mixin = require('../mixin');
var View = require('ampersand-view').extend(mixin);


test('it renders', function (t) {
    var view = new View({
        template: '<div><h1>Hi!</h1></div>',
    });

    view.render();
    t.equal(view.query('h1').innerHTML, 'Hi!');
    t.end();
});

test('it rerenders', function (t) {
    var render = 0;

    var view = new View({
        template: function () {
            render++;
            if (render === 1) {
                return '<div><h1>First</h1></div>';
            } else {
                return '<div><h1>Second</h1></div>';
            }
        }
    });

    view.render();
    t.equal(view.query('h1').innerHTML, 'First');

    view.render();
    t.equal(view.query('h1').innerHTML, 'Second');

    t.end();
});

test('it does not lose focus on rerender', function (t) {
    var renders = 0;
    var view = new View({
        template: function () {
            renders++;
            return '<div><h1>' + renders + '</h1><input name=foo type=text></div>';
        }
    });
    view.render();

    document.body.appendChild(view.el);
    var input = view.query('input');
    input.focus();

    setTimeout(function () {
        t.equal(document.querySelector('h1').innerHTML, '1', 'Rendered correctly');
        t.equal(document.activeElement, input, 'Has focus on input');

        view.render();
        t.equal(document.querySelector('h1').innerHTML, '2', 'Rerendered correctly');
        t.equal(document.activeElement, input, 'Still has focus on input');

        view.remove();
        t.end();
    }, 0);
});

test('it can be attached to an existing el', function (t) {
    var initialEl = document.createElement('div');
    initialEl.innerHTML = '<h1>Foo!</h1><h2>Bar</h2>';
    document.body.appendChild(initialEl);

    var initialH1 = initialEl.querySelector('h1');
    var initialH2 = initialEl.querySelector('h2');

    var view = new View({
        el: initialEl,
        template: '<div><h1>Baz!</h1></div>'
    });

    view.render();

    t.ok(initialH1.parentNode, 'H1 should not be removed');
    t.equal(initialH1.innerHTML, 'Baz!', 'H1 text should be updated');
    t.notOk(initialH2.parentNode, 'H2 should be removed');
    t.end();
});
