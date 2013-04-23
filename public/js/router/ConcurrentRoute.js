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
