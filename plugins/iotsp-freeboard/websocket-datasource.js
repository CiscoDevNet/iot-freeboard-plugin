/**
 * @author ivanders
 * @description
 */
(function(){

	freeboard.loadDatasourcePlugin({

		type_name : "CiscoIoTSP-WS-plugin",

		display_name : "Cisco IoTSP WebSocket plugin",

		description : "A plugin to connect to the Cisco IoT Platform",

		settings : [{
			name : 'thingUid',
			displayName : 'thingUid',
			type : 'text',
			description : 'The thing Uid for the device you want to display data from.'
		},{
			name : 'clusterUrl',
			displayName : 'Cluster URL',
			type : 'text',
			description :'The url where your IoTSP cluster is running'
		}],

		newInstance : function(settings, newInstanceCallback, updateCallback){

			newInstanceCallback(new CiscoIoTSP_plugin(settings, updateCallback));

		}

	});



	/**
	 * Plugin code for the CiscoIoTSP_plugin
	 *
	 * @param settings
	 * @param updateCallback
	 * @constructor
	 */
	var CiscoIoTSP_plugin = function(settings, updateCallback) {

		var self = this;
		var currentSettings = settings;
		var wsConn;

		var onOpen = function() {
			console.info("WebSocket(%s) Opened", currentSettings.url);
		};

		var onClose = function(){
			console.info("WebSocket Closed");
		};

		var onMessage=function(event) {

			var data=event.data;

			console.info("WebSocket received %s",data);
			var objdata;

			try {
				objdata=JSON.parse(data);
			} catch(e){
				console.log('invalid json received');
			}

			if(typeof objdata == "object") {
				updateCallback(objdata);
			} else	{
				updateCallback(data);
			}

		};

		var refreshTimer;

		function createWebSocket() {

			if(wsConn) wsConn.close();

			console.log(currentSettings);

			var url=currentSettings.clusterUrl;

			wsConn=new WebSocket(url);

			wsConn.onopen=onOpen;
			wsConn.onclose=onClose;
			wsConn.onmessage=onMessage;

		}


		self.onSettingsChanged = function(newSettings) {
			currentSettings = newSettings;

			createWebSocket();
		};


		self.updateNow = function() {
			createWebSocket();
		};

		self.onDispose = function() {
			wsConn.close();
		};


		createWebSocket();
	};


}());