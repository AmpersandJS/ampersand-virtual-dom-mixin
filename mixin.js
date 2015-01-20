var parse = require('html-parse-stringify').parse;
var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var isString = require('amp-is-string');
var getPath = require('get-object-path');

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
        this.trigger('render:after');
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
    },

    _parseSubview: function (subview, name) {
        this._subviewStatus = this._subviewStatus || {};

        var self = this;
        var opts = {
            selector: subview.container || '[data-hook="' + subview.hook + '"]',
            waitFor: subview.waitFor || '',
            prepareView: subview.prepareView || function () {
                return new subview.constructor({
                    //el: el,
                    parent: self
                });
            }
        };

        function updateSubview () {
            var el, subview;

            if (this._subviewStatus[name] && this._subviewStatus[name].rendered) {
                //Remove if rendered but no longer in the dom
                if (!this.query(opts.selector)) {
                    this._subviewStatus[name].view.remove();
                    delete this._subviewStatus[name];
                    delete this[name];
                }
            } else {
                if (!this.el || !(el = this.query(opts.selector))) {
                    return;
                }

                if (!opts.waitFor || getPath(this, opts.waitFor)) {
                    subview = this[name] = opts.prepareView.call(this);
                    subview.render();
                    this._subviewStatus[name] = {
                        rendered: true,
                        view: subview
                    };
                    el.appendChild(subview.el);
                    this.registerSubview(subview);
                }
            }
        }

        //this.on('change', updateSubview, this);
        this.on('render:after', updateSubview, this);
    }
};
