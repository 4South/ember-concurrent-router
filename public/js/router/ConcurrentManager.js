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
