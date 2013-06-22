//------------------------------------------------------------------------------
//
// Constructor
//
//------------------------------------------------------------------------------

// The QuerySteps class contains several utility functions shared by the Query and
// Condition objects.
function QuerySteps(options) {
  this.deserialize(options);
}

//------------------------------------------------------------------------------
//
// Methods
//
//------------------------------------------------------------------------------

//--------------------------------------
// Steps
//--------------------------------------

// Adds a step to the parent.
QuerySteps.addStep = function(parent, step) {
  step.parent = parent;
  parent.steps.push(step);
}

// Removes a step from the parent.
QuerySteps.removeStep = function(parent, step) {
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

// Finds a selection by name in the query.
QuerySteps.getSelection = function(parent, name) {
  for(var i=0; i<(parent.steps || []).length; i++) {
    var step = parent.steps[i];
    if(step instanceof QuerySelection) {
      if(step.name == name) {
        return step;
      }
    }
    else if(step instanceof QueryCondition) {
      var ret = step.getSelection(name);
      if(ret) {
        return ret;
      }
    }
  }
  return null;
}

//--------------------------------------
// Serialization
//--------------------------------------

// Serializes the steps into an array of hashes.
QuerySteps.serialize = function(steps) {
  var ret = [];
  for(var i=0; i<(steps || []).length; i++) {
    ret.push(steps[i].serialize());
  }
  return ret;
}

// Deserializes an array of hashes into steps.
QuerySteps.deserialize = function(parent, arr) {
  parent.steps = [];
  for(var i=0; i<(arr || []).length; i++) {
    var step;
    if(arr[i] instanceof QuerySelection || arr[i] instanceof QueryCondition) {
      step = arr[i];
    } else {
      if(arr[i].type == "selection") {
        step = new QuerySelection();
      } else if(arr[i].type == "condition") {
        step = new QueryCondition();
      } else {
        throw "invalid step type: '" + arr[i].type + "'";
      }
      step.deserialize(arr[i]);
    }
    parent.addStep(step);
  }
}