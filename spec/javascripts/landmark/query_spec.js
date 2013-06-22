describe("Query", function () {
  var data =
    {
      sessionIdleTime: 7200,
      steps: [{
        type: 'condition',
        expression: "action == '/index.html'",
        within: null,
        withinUnits: 'steps',
        steps: [{
          type: 'selection',
          name: '0.0',
          dimensions: [],
          fields: [{
            name: 'count',
            expression: 'count()'
          }]
        }, {
          type: 'condition',
          expression: 'true',
          within: [1,1],
          withinUnits: 'steps',
          steps: [{
            type: 'selection',
            name: '1.0',
            dimensions: ['action'],
            fields: [{
              name: 'count',
              expression: 'count()'
            }]
          }]
        }]
      }]
    };

  it("initializes without arguments", function() {
    var condition = new Query();
    expect(condition.sessionIdleTime).toEqual(0);
    expect(condition.steps).toEqual([]);
  });

  it("initializes with arguments", function() {
    var c0 = new QueryCondition();
    var query = new Query({sessionIdleTime:7200, steps:[c0]});
    expect(query.sessionIdleTime).toEqual(7200);
    expect(query.steps).toEqual([c0]);
  });

  it("serializes to a hash", function() {
    var query =
      new Query({sessionIdleTime:7200, steps:[
        new QueryCondition({expression:"action == '/index.html'", steps:[
          new QuerySelection({name:"0.0", dimensions:[], fields:[new QuerySelectionField({name:"count", expression:"count()"})]}),
          new QueryCondition({expression:"true", within:[1,1], steps:[
            new QuerySelection({name:"1.0", dimensions:["action"], fields:[new QuerySelectionField({name:"count", expression:"count()"})]}),
          ]})
        ]})
      ]});
    expect(query.serialize()).toEqual(data);
  });

  it("deserializes from a hash", function() {
    var query = new Query(data);
    expect(query.serialize()).toEqual(data);
  });
});
