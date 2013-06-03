describe("QuerySelection", function () {
  it("initializes without arguments", function() {
    var selection = new QuerySelection();
    expect(selection.name).toEqual("");
    expect(selection.dimensions).toEqual([]);
    expect(selection.fields).toEqual([]);
  });

  it("initializes with arguments", function() {
    var f0 = new QuerySelectionField(), f1 = new QuerySelectionField();
    var selection = new QuerySelection("foo", ["city","state"], [f0, f1]);
    expect(selection.name).toEqual("foo");
    expect(selection.dimensions).toEqual(["city", "state"]);
    expect(selection.fields).toEqual([f0, f1]);
  });

  it("adds a field", function() {
    var field = new QuerySelectionField();
    var selection = new QuerySelection();
    selection.addField(field);
    expect(selection.fields.length).toEqual(1);
    expect(field.selection).toEqual(selection);
  });

  it("removes a field", function() {
    var f0 = new QuerySelectionField(), f1 = new QuerySelectionField();
    var selection = new QuerySelection();
    selection.addField(f0);
    selection.addField(f1);
    selection.removeField(f0);
    expect(selection.fields.length).toEqual(1);
    expect(f0.selection).toEqual(null);
    expect(f1.selection).toEqual(selection);
  });

  it("serializes to a hash", function() {
    var selection = new QuerySelection("foo", ["city","state"], [new QuerySelectionField("bar", "baz == 100")]);
    expect(selection.serialize()).toEqual(
      {
        "type":"selection",
        "name":"foo",
        "dimensions":["city", "state"],
        "fields":[{"name":"bar", "expression":"baz == 100"}],
      }
    );
  });

  it("deserializes from a hash", function() {
    var selection = new QuerySelection();
    selection.deserialize({
      "type":"selection",
      "name":"foo",
      "dimensions":["city", "state"],
      "fields":[{"name":"bar", "expression":"baz == 100"}],
    })
    expect(selection.name).toEqual("foo");
    expect(selection.dimensions).toEqual(["city","state"]);
    expect(selection.fields.length).toEqual(1);
    expect(selection.fields[0].serialize()).toEqual({"name":"bar", "expression":"baz == 100"});
  });
});
