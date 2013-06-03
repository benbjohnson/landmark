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
// Steps
//--------------------------------------

// Adds a step to the condition.
QueryCondition.prototype.addStep = function(step) {
  Steps.addStep(this, step);
}

// Removes a step from the condition.
QueryCondition.prototype.removeStep = function(step) {
  Steps.removeStep(this, step);
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
    steps:Steps.serialize(this, step)
  };
}

// Deserializes the condition from a hash.
QueryCondition.prototype.deserialize = function(obj) {
  this.expression = obj.expression || "";
  this.withinRangeStart = obj.withinRangeStart;
  this.withinRangeEnd = obj.withinRangeEnd;
  this.withinUnits = obj.withinUnits || "steps";
  this.steps = Steps.deserialize(this, obj.steps);
}
