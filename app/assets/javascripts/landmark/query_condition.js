//------------------------------------------------------------------------------
//
// Constructor
//
//------------------------------------------------------------------------------

function QueryCondition(expression, withinRangeStart, withinRangeEnd, withinUnits, steps) {
  this.expression = expression || "";
  this.withinRangeStart = withinRangeStart || 0;
  this.withinRangeEnd = withinRangeEnd || 0;
  this.withinUnits = withinUnits || "steps";
  this.steps = [];
  for(var i=0; i<(steps||[]).length; i++) {
    this.addStep(steps[i]);
  }
}

//------------------------------------------------------------------------------
//
// Methods
//
//------------------------------------------------------------------------------

//--------------------------------------
// Hierarchy
//--------------------------------------

// Retrieves the top-level query associated with this condition.
QueryCondition.prototype.getQuery = function() {
  if(this.parent) {
    return this.parent.getQuery();
  }
  return null;
}

// Adds a step to the condition.
QueryCondition.prototype.addStep = function(step) {
  QuerySteps.addStep(this, step);
}

// Removes a step from the condition.
QueryCondition.prototype.removeStep = function(step) {
  QuerySteps.removeStep(this, step);
}

//--------------------------------------
// Serialization
//--------------------------------------

// Serializes the condition to a hash.
QueryCondition.prototype.serialize = function() {
  return {
    expression:this.expression,
    withinRangeStart:this.withinRangeStart,
    withinRangeEnd:this.withinRangeEnd,
    withinUnits:this.withinUnits,
    steps:QuerySteps.serialize(this.steps)
  };
}

// Deserializes the condition from a hash.
QueryCondition.prototype.deserialize = function(obj) {
  this.expression = obj.expression || "";
  this.withinRangeStart = obj.withinRangeStart;
  this.withinRangeEnd = obj.withinRangeEnd;
  this.withinUnits = obj.withinUnits || "steps";
  QuerySteps.deserialize(this, obj.steps);
}
