# ampersand-virtual-dom-mixin

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
