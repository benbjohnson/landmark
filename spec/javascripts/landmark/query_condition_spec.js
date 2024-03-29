describe("QueryCondition", function () {
  it("initializes without arguments", function() {
    var condition = new QueryCondition();
    expect(condition.expression).toEqual("");
    expect(condition.within).toEqual(null);
    expect(condition.withinUnits).toEqual("steps");
    expect(condition.steps).toEqual([]);
  });

  it("initializes with arguments", function() {
    var s0 = new QuerySelection();
    var condition = new QueryCondition({expression:"foo == 'bar'", within:[1,2], withinUnits:"sessions", steps:[s0]});
    expect(condition.expression).toEqual("foo == 'bar'");
    expect(condition.within).toEqual([1,2]);
    expect(condition.withinUnits).toEqual("sessions");
    expect(condition.steps).toEqual([s0]);
  });

  it("serializes to a hash", function() {
    var condition = new QueryCondition({expression:"foo == 'bar'", within:[1,2], withinUnits:"sessions", steps:[new QuerySelection()]});
    expect(condition.serialize()).toEqual(
      {
        "type":"condition",
        "expression":"foo == 'bar'",
        "within":[1,2],
        "withinUnits":"sessions",
        "steps":[{"type":"selection","name":"", "dimensions":[], "fields":[]}],
      }
    );
  });

  it("deserializes from a hash", function() {
    var condition = new QueryCondition();
    condition.deserialize({
      "expression":"foo == 'bar'",
      "within":[1,2],
      "withinUnits":"sessions",
      "steps":[{"type":"selection","name":"", "dimensions":[], "fields":[]}],
    })
    expect(condition.expression).toEqual("foo == 'bar'");
    expect(condition.within).toEqual([1,2]);
    expect(condition.withinUnits).toEqual("sessions");
    expect(condition.steps[0] instanceof QuerySelection).toEqual(true);
    expect(condition.steps[0].parent).toEqual(condition);
  });
});
