//USE THIS FOR ROUTES WITH CONCURRENT STATES
App.ParentConcurrentRoute = Ember.Route.extend({

  //TODO: EVENTS

  init: function () {
    this._super();
    var tempRouters = [];

    //"inject" the parent Route onto all subRouters
    //create a route recognizer to use with suburls 
    this.get('subRouters').forEach( function (routerName) {
      var router = this.get(routerName);
      if (!router) { 
        throw new Ember.Error('no subrouter found named ', routerName);
      }
      tempRouters.push(router.create({
        parentRoute: this,
        subRouteRec: new RouteRecognizer(),
      }));
    }, this);
    this.set('subRouters', tempRouters);
  },

  //this is overridden in init and replaced with an array of instantiated
  //ConcurrentManagers
  subRouters: [],

  activateSubRouters: function(params) {
    this.get('subRouters').forEach( function(router) {
      router.send('activate', params);
    });
  },

  deserialize: function(params) {
    var model = this.model(params); 
    this.activateSubRouters(params);
    return this.currentModel = model;
  },
});
