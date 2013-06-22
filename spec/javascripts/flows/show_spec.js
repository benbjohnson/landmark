describe("flows/show", function () {
  //----------------------------------------------------------------------------
  //
  // Fixtures
  //
  //----------------------------------------------------------------------------

  var QUERY =
    new Query({sessionIdleTime:7200, steps:[
      new QueryCondition({expression:"action == '/index.html'", steps:[
        new QuerySelection({name:"0.0", dimensions:["action"], fields:[new QuerySelectionField({name:"count", expression:"count()"})]}),
        new QueryCondition({expression:"true", within:[1,1], steps:[
          new QuerySelection({name:"1.0", dimensions:["action"], fields:[new QuerySelectionField({name:"count", expression:"count()"})]}),
        ]})
      ]})
    ]});

  var NODES = [
    {id:'0.0-/index.html', name:'/index.html', value:20, depth:0, subdepth:0, selection:QUERY.steps[0].steps[0]},
    {id:'1.0-/signup.html', name:'/signup.html', value:10, depth:1, subdepth:0, selection:QUERY.steps[0].steps[1].steps[0]},
    {id:'1.0-/about-us.html', name:'/about-us.html', value:2, depth:1, subdepth:0, selection:QUERY.steps[0].steps[1].steps[0]},
  ];

  //----------------------------------------------------------------------------
  //
  // Tests
  //
  //----------------------------------------------------------------------------

  it("normalizes query results into nodes", function() {
    var nodes = landmark.show.normalize(QUERY, {
      "0.0": {
        "action": {
          "/index.html": {
            "count": 20
          }
        }
      },
      "1.0": {
        "action": {
          "/about-us.html": {
            "count": 2
          },
          "/signup.html": {
            "count": 10
          }
        }
      }
    });
    
    expect(nodes.length).toEqual(3);
    expect(nodes[0]).toEqual(NODES[0]);
    expect(nodes[1]).toEqual(NODES[1]);
    expect(nodes[2]).toEqual(NODES[2]);
  });

  it("normalizes nodes into links", function() {
    var links = landmark.show.links(NODES);
    expect(links.length).toEqual(2);
    expect(links[0]).toEqual({source:NODES[0], target:NODES[1], value:10});
    expect(links[1]).toEqual({source:NODES[0], target:NODES[2], value:2});
  });
});
