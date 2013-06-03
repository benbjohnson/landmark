//------------------------------------------------------------------------------
//
// Constructor
//
//------------------------------------------------------------------------------

// The Steps class contains several utility functions shared by the Query and
// Condition objects.
function Steps() {
}

//------------------------------------------------------------------------------
//
// Methods
//
//------------------------------------------------------------------------------

//--------------------------------------
// Utility
//--------------------------------------

// Adds a step to the parent.
Steps.addStep = function(parent, step) {
  if(!parent.getQuery()) {
    throw("cannot add step to unassociated parent")
  }
  step.parent = parent;
  parent.steps.push(step);
}

// Removes a step from the parent.
Steps.removeStep = function(parent, step) {
  for(var i=0; i<parent.steps.length; i++) {
    if(parent.steps[i] == step) {
      step.parent = null;
      parent.steps.splice(i--, 1);
      return;
    }
    if(parent.steps[i] instanceof Condition) {
      parent.steps[i].removeStep(step);
    }
  }
}

//--------------------------------------
// Serialization
//--------------------------------------

// Serializes the steps into an array of hashes.
Steps.serialize = function(steps) {
  var ret = [];
  for(var i=0; i<steps.length; i++) {
    ret.push(steps[i].serialize());
  }
  return ret;
}
