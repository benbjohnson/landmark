//------------------------------------------------------------------------------
//
// Constructor
//
//------------------------------------------------------------------------------

function Query(sessionIdleTime, steps) {
  this.sessionIdleTime = sessionIdleTime || 0;
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

// Retrieves the query.
Query.prototype.getQuery = function() {
  return this;
}

// Adds a step to the query.
Query.prototype.addStep = function(step) {
  Steps.addStep(this, step);
}

// Removes a step from the query.
Query.prototype.removeStep = function(step) {
  Steps.removeStep(this, step);
}

//--------------------------------------
// Serialization
//--------------------------------------

// Serializes the query to a hash.
Query.prototype.serialize = function() {
  return {sessionIdleTime:this.sessionIdleTime, steps:Steps.serialize(this.steps)};
}

// Deserializes the query from a hash.
Query.prototype.deserialize = function(obj) {
  this.sessionIdleTime = obj.sessionIdleTime || 0;
  this.steps = Steps.deserialize(this, obj.steps);
}
