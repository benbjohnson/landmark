describe("flows/show", function () {
  //----------------------------------------------------------------------------
  //
  // Fixtures
  //
  //----------------------------------------------------------------------------

  var query =
    new Query({sessionIdleTime:7200, steps:[
      new QueryCondition({expression:"action == '/index.html'", steps:[
        new QuerySelection({name:"0.0", dimensions:["action"], fields:[new QuerySelectionField({name:"count", expression:"count()"})]}),
        new QueryCondition({expression:"true", within:[1,1], steps:[
          new QuerySelection({name:"1.0", dimensions:["action"], fields:[new QuerySelectionField({name:"count", expression:"count()"})]}),
        ]})
      ]})
    ]});


  //----------------------------------------------------------------------------
  //
  // Tests
  //
  //----------------------------------------------------------------------------

  it("normalizes returned query data", function() {
    var nodes = landmark.show.normalize(query, {
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
    expect(nodes[0]).toEqual({id:'0.0-/index.html', name:'/index.html', value:20, depth:0, subdepth:0, selection:query.steps[0].steps[0]});
    expect(nodes[1]).toEqual({id:'1.0-/signup.html', name:'/signup.html', value:10, depth:1, subdepth:0, selection:query.steps[0].steps[1].steps[0]});
    expect(nodes[2]).toEqual({id:'1.0-/about-us.html', name:'/about-us.html', value:2, depth:1, subdepth:0, selection:query.steps[0].steps[1].steps[0]});
  });
});
