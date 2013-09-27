(function() {

function Landmark() {
  this._readied = false;
  this._user = user;
}

Analytics.prototype.init =
Analytics.prototype.initialize = function(apiKey) {
  this._options(options);
  this._readied = false;
  this._integrations = {};

  // load user now that options are set
  this._user.load();

  // make ready callback
  var self = this;
  var ready = after(size(settings), function () {
    self._readied = true;
    var callback;
    while (callback = self._callbacks.shift()) callback();
  });

  // initialize integrations, passing ready
  each(settings, function (name, options) {
    var Integration = self.Integrations[name];
    if (!Integration) return self;
    var integration = new Integration(options, ready, self);
    self._integrations[name] = integration;
  });

  // call any querystring methods if present
  this._parseQuery();

  // backwards compat with angular plugin.
  // TODO: remove
  this.initialized = true;

  return this;
};

})();
