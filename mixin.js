var parse = require('html-parse-stringify').parse;
var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var isString = require('amp-is-string');


module.exports = {
    renderOnViewChange: function () {
        this.on('change', this.render);
    },
    renderOnModelChange: function () {
        if (this.model) {
            this.listenTo(this.model, 'change', this.render);
        }
    },
    renderWithTemplate: function (data) {
        var firstRender = !this.tree || !this.el;
        var renderedTemplate, newTree;

        if (isString(this.template)) {
            renderedTemplate = this.template;
        } else {
            renderedTemplate = this.template(data || this);
        }

        newTree = this.astToVdom(parse(renderedTemplate.trim()));

        if (firstRender) {
            var el = createElement(newTree);
            this.tree = newTree;
            if (this.setElement) {
                this.el.appendChild(el);
                this._backboneEl = el;
            } else {
                this.el = el;
            }
        } else {
            var patches = diff(this.tree, newTree);
            this.tree = newTree;
            patch(this._backboneEl || this.el, patches);
        }
    },

    astToVdom: function (ast) {
        if (ast.type === 'text') {
            return ast.content;
        }

        if (ast.type === 'tag') {
            if (!(this.components||{})[ast.name]) {
                return h(ast.name, this.parseTagAttrs(ast.attrs), ast.children.map(this.astToVdom, this));
            } else {

                //TODO: this whole bit needs some work;
                var Constructor = this.components[ast.name];
                var attrs = this.parseComponentAttrs(ast.attrs);

                return {
                    type: 'Widget',
                    name: 'MyWidget',
                    id: ast.attrs.key,
                    key: ast.attrs.key,
                    init: function () {
                        this.view = new Constructor(attrs);
                        this.view.render();
                        return this.view.el;
                    },
                    update: function (previous, dom) {
                        this.view = previous.view;
                        this.view.set(attrs);
                        return this.view.el;
                    },
                    destroy: function () {
                        this.view.remove();
                    }
                };
            }
        }
    },

    parseComponentAttrs: function (attrs) {
        var key, val, path, match;
        var isCurlyRe = /^\s*{\s*([^}]+)\s*}\s*$/;

        for (key in attrs) {
            val = attrs[key];

            match = val.match(isCurlyRe);
            if (!match) {
                attrs[key] = coerce(val);
            } else {
                path = match[1].split('.');
                attrs[key] = path.reduce(function (o, pathPart) {
                    return o && o[pathPart];
                }, this);
            }
        }
        return attrs;
    },

    parseTagAttrs: function (attrs) {
        attrs = {
            attributes: attrs
        };
        var keep = ['key', 'namespace'];
        var i = keep.length;
        var k;

        while(i--) {
            k = keep[i];
            if (attrs.attributes[k]) {
                attrs[k] = attrs.attributes[k];
                delete attrs.attributes[k];
            }
        }
        return attrs;
    }
};

function coerce(str) {
    var trimmed = str.trim();
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (!isNaN(trimmed)) return parseFloat(trimmed);
    return str;
}
