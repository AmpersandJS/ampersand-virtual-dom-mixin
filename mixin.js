var parse = require('html-parse-stringify').parse;
var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var isString = require('amp-is-string');

function astAttrsToVdomAttrs(attrs) {
    var tagAttrs = {
        attributes: attrs
    };

    tagAttrs.key = attrs.key;
    delete attrs.key;

    tagAttrs.namespace = attrs.namespace;
    delete attrs.namespace;

    return tagAttrs;
}


module.exports = {
    renderOnViewChange: function () {
        this.on('change', this.render);
    },

    renderOnModelChange: function () {
        if (this.model) {
            this.listenTo(this.model, 'change', this.render);
        }
    },

    renderTemplateToVdom: function (data) {
        var renderedTemplate;

        if (isString(this.template)) {
            renderedTemplate = this.template;
        } else {
            renderedTemplate = this.template(data || this);
        }

        return this.astToVdom(parse(renderedTemplate.trim()));
    },

    renderWithTemplate: function (data) {
        var newTree = this.renderTemplateToVdom(data);
        var isBackbone = typeof this.setElement === 'function';
        var isFirstRender;

        //view was initialized with an el, not yet rendered
        if (!this.tree && this.el) {
            this.tree = this.astToVdom(parse(this.el.outerHTML));
            isFirstRender = true;
        }

        //first render
        if (!this.el) {
            isFirstRender = true;
            var el = createElement(newTree);
            this.tree = newTree;
            if (isBackbone) {
                this.el.appendChild(el);
                this._backboneEl = el;
            } else {
                this.el = el;
            }
        //subsequent renders
        } else {
            var patches = diff(this.tree, newTree);
            this.tree = newTree;
            if (isBackbone) {
                patch(this._backboneEl, patches);
            } else {
                patch(this.el, patches);
            }
        }

        if (isFirstRender && this.onFirstRender) {
            this.onFirstRender(data);
        }
    },

    astToVdom: function (ast) {
        if (ast.type === 'text') {
            return ast.content;
        }

        if (ast.type === 'tag') {
            return h(
                ast.name,
                astAttrsToVdomAttrs(ast.attrs),
                ast.children.map(this.astToVdom, this)
            );
        }
    }
};
