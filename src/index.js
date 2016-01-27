var Flow = require('flow.js');
var FustyFlow = require('./fusty-flow');
var fustyFlowFactory = require('./fusty-flow-factory');

module.exports = {
  Flow: Flow, //To avoid breaking changes in the standalone version
	FustyFlow: FustyFlow,
	fustyFlowFactory: fustyFlowFactory
};