var Flow = require('flow.js');
var FustyFlow = require('./fusty-flow');

var fustyFlowFactory = function (opts) {
  var flow = new Flow(opts);
  if (flow.support) {
    return flow;
  }
  return new FustyFlow(opts);
}

module.exports = fustyFlowFactory;