var testHelper, store;

module('FactoryGuy with DS.FixtureAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.FixtureAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});


test("#pushFixture adds fixture to Fixture array on model", function() {
  var fixtureJson = FactoryGuy.build('user');
  FactoryGuy.pushFixture(User, fixtureJson);
  equal(User.FIXTURES.length, 1);

  var fixtureJson2 = FactoryGuy.build('user');
  FactoryGuy.pushFixture(User, fixtureJson2);
  equal(User.FIXTURES.length, 2);
});


asyncTest("can change fixture attributes after creation", function() {
  var user = store.makeFixture('user');
  user.name = "new name";

  store.find('user', 1).then( function(user) {
    equal(user.get('name'), "new name", "changes local attributes");
    start();
  });
});


test("#resetModels clears the store of models, clears the FIXTURES arrays for each model and resets the model definition", function() {
  var project = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [project.id]});

  for (model in FactoryGuy.modelDefinitions) {
    var definition = FactoryGuy.modelDefinitions[model];
    sinon.spy(definition, 'reset');
  }

  FactoryGuy.resetModels(store);

  equal(User.FIXTURES.length, 0);
  equal(Project.FIXTURES.length, 0);

  equal(store.all('user').get('content.length'), 0)
  equal(store.all('project').get('content.length'), 0)

  for (model in FactoryGuy.modelDefinitions) {
    var definition = FactoryGuy.modelDefinitions[model];
    ok(definition.reset.calledOnce);
    definition.reset.restore();
  }
});


module('DS.Store with DS.FixtureAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.FixtureAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});


test("#makeFixture builds and pushes fixture into the models FIXTURE array", function() {
  var json = store.makeFixture('user');
  equal(User.FIXTURES.length, 1);
  equal(User.FIXTURES[0], json);
});


asyncTest("#makeFixture sets belongsTo on hasMany associations", function() {
  var p1 = store.makeFixture('project');
  // second project not added on purpose to make sure only one is
  // assigned in hasMany
  store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [p1.id]})

  store.find('user', 1).then( function(user) {
    user.get('projects').then( function(projects) {
      equal(projects.get('length'), 1, "adds hasMany records");
      equal(projects.get('firstObject.user.id'), user.id, "sets belongsTo record");
      start();
    })
  })
})


asyncTest("#makeFixture adds record to hasMany association array for which it belongsTo", function() {
  var userJson = store.makeFixture('user');
  var projectJson = store.makeFixture('project', {user: userJson.id});

  store.find('user', userJson.id).then( function(user) {
    user.get('projects').then( function(projects) {
      equal(projects.get('length'), 1, "adds hasMany records");
      equal(projects.get('firstObject.user.id'), user.id, "sets belongsTo record");
      start();
    })
  })
})


asyncTest("#createRecord adds belongsTo association to records it hasMany of", function() {
  var user = store.makeFixture('user');

  store.find('user', user.id).then(function(user) {

    var projectJson = {title:'project', user: user};

    store.createRecord('project', projectJson).save()
      .then( function() {
        equal(user.get('projects.length'), 1);
        start();
      });
  })
})
