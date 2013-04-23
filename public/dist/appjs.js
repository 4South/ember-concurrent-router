minispade.register('application/Application.js', function() {
window.App = Ember.Application.create();minispade.require('controllers/ApplicationController.js');minispade.require('controllers/SublevelController.js');minispade.require('views/SublevelView.js');minispade.require('router/Router.js');
});

minispade.register('controllers/ApplicationController.js', function() {
App.ApplicationController = Ember.Controller.extend();
});

minispade.register('controllers/SublevelController.js', function() {
App.SublevelController = Ember.Controller.extend({
  example: 'some string I made up',
});
});

minispade.register('router/ConcurrentManager.js', function() {
//SHOULD DEFINE initialState, subRoutes, and all states (subroutes)
App.ConcurrentManager = Ember.StateManager.extend({

  //eventually would like to use a syntax/api similar to Ember's Router.map
  //for now, routes are defined in the subRoutes array with the format
  //{path: "your/path/here", handler: handlerfunction}
  init: function() {
    this._super();
    var srr = this.get('subRouteRec');

    this.get('subRoutes').forEach( function (route) {
      //only successful when adding each path one at a time...
      srr.add([route]);
    }, this);
  },

  paramListName: null,
  subRoutes: [],

  model: function(manager, suburl) {
    throw new Ember.Error('every subroute should define a model method!');
  }, 

  setupController: function(manager, controller, model) {
    controller.set('content', model);
  },

  renderTemplate: function(manager, controller, model) {
    return;
  },

  //retrieves the appropriate hash of data from all url dynamic segments
  //passed in as params
  obtainSubParams: function (params) {
    if (!this.get('paramListName')) {
      throw new Ember.Error('must implement paramListName');
    }
    return params[this.get('paramListName')];
  },

  //called from parent routes deserialize and used to transition to state
  activate: function(manager, params) {
    var srr = this.get('subRouteRec'),
        context = this.obtainSubParams(params),
        match = srr.recognize(context),
        model,
        name,
        controller,
        container = this.get('parentRoute.container');

    if (match) {
      manager.transitionTo(context.replace("/", "."));
      model = manager.send('model', context);
      name = manager.send('getName');

      //check if a controller is defined
      controller = container.lookup('controller:' + name);

      //if not already defined, register one then find it
      if (!controller) {
        Ember.generateController(container, name);
        controller = container.lookup('controller:' + name);
      }
      manager.send('setupController', controller, model); 
      manager.send('renderTemplate', controller, model);
      
    } else {
      this.transitionTo(manager.get('initialState'));
    }
  },
});
});

minispade.register('router/ConcurrentRoute.js', function() {
App.ConcurrentRoute = Ember.State.extend({
  getName: function (manager) {
    return this.get('name');
  },
  model: function (manager, suburl) {
    throw new Ember.Error (this.get('name'), ' must implement model');
  },
  //renderTemplate: function(manager, controller, model) {},
  //setupController: function(manager, controller, model) {},
  //enter: function (manager) {}, 
  //exit: function (manager) {},
});
});

minispade.register('router/ParentConcurrentRoute.js', function() {
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
});

minispade.register('router/Router.js', function() {
minispade.require('router/ParentConcurrentRoute.js');minispade.require('router/ConcurrentManager.js');minispade.require('router/ConcurrentRoute.js');

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
});

minispade.register('views/SublevelView.js', function() {
App.SublevelView = Ember.View.extend();
});
