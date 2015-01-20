# ampersand-virtual-dom-mixin

## *NOTE:* this module is intentially at 0.x.x since the public api is still under discussion. minor/patch releases may be breaking changes until 1.0.0 hits. _Community feedback wanted_

```js
var vdomMixin = require('ampersand-virtual-dom-mixin');
var View = require('ampersand-view');

var MyView = View.extend(vdomMixin, {
    template: require('my-template.jade'), //if useing jadeify, or whatever

    initialize: function () {
        //you just need to trigger render when things change,
        //the simplest might be:

        this.on('change', this.render);
    }
});
```

## Notes on usage of this version:

* There's a demo.js in the repo `npm run demo`, http://localhost:9967
* Rendering subviews manually in an overridden render method is an anti-pattern with this mixin. You'll want to use the `subviews` hash to do so declaratively.
* This enables you in a template to render/remove the target el for a subview, and that el will be created/torn down appropriately.
* This mixin rewrites `_parseSubview`. The prepareView function will no longer receive an `el`, so rendered subviews will be appended to, rather than replace, the selected el.
* component rendering has been removed, for now.
