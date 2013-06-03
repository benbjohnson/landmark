describe("QuerySelectionField", function () {
  it("initializes without arguments", function() {
    var field = new QuerySelectionField();
    expect(field.name).toEqual("");
    expect(field.expression).toEqual("");
  });

  it("initializes with arguments", function() {
    var field = new QuerySelectionField("foo", "bar == 10");
    expect(field.name).toEqual("foo");
    expect(field.expression).toEqual("bar == 10");
  });

  it("serializes to a hash", function() {
    var field = new QuerySelectionField("foo", "bar == 10");
    expect(field.serialize()).toEqual(
      {
        "name":"foo",
        "expression":"bar == 10"
      }
    );
  });

  it("deserializes from a hash", function() {
    var field = new QuerySelectionField();
    field.deserialize({"name":"foo", "expression":"bar == 10"});
    expect(field.name).toEqual("foo");
    expect(field.expression).toEqual("bar == 10");
  });
});
