(function (Flow, FustyFlow, window) {
  'use strict';

  var FustyFlowFactory = function (opts) {
    var flow = new Flow(opts);
    if (flow.support) {
      return flow;
    }
    return new FustyFlow(opts);
  }

  window.FustyFlowFactory = FustyFlowFactory;

})(window.Flow, window.FustyFlow, window);