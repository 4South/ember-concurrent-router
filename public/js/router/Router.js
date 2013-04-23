require('router/ParentConcurrentRoute.js');
require('router/ConcurrentManager.js');
require('router/ConcurrentRoute.js');

App.Router.map(function() {
  this.route("menu", {path: "/menu/upper/*upperpath/lower/*lowerpath"});
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.replaceWith('menu');
  }
});

App.UpperMainConRoute = App.ConcurrentRoute.extend({
  model: function (manager, suburl) {
    return null;
  },
});

App.UpperSecondarySublevelConRoute = App.ConcurrentRoute.extend({
  model: function(manager, suburl) {
    return this.currentModel = Ember.Object.create({test: suburl});
  },
  getName: function (manager) {
    return this.get('name');
  },
  renderTemplate: function(manager, controller, model) {
    //render method from parent route uses private functions...
    var parentRoute = manager.get('parentRoute'),
        name = 'sublevel',
        hash = {into: 'menu', outlet: 'upper', controller: controller};
        
    //must call this on the next runloop because parent templates
    //are not yet loaded
    Ember.run.next(parentRoute, parentRoute.render, name, hash);
  },
});

App.UpperSecondaryConRoute = App.ConcurrentManager.extend({
  model: function (manager, suburl) { 
    return null;
  },
  //SUBSTATE OF SECONDARY
  sublevel: App.UpperSecondarySublevelConRoute,
});

App.UpperManager = App.ConcurrentManager.extend({
  paramListName: 'upperpath',
  subRoutes: [{path: "/:primary/:secondary", handler: null}],

  initialState: "main",

  main: App.UpperMainConRoute,
  secondary: App.UpperSecondaryConRoute,
});

App.MenuRoute = App.ParentConcurrentRoute.extend({
  subRouters: ['upper'],
  //concurrent state managers
  upper: App.UpperManager,
});
