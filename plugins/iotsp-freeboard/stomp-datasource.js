/**
 * @author hienng
 * @description Cisco IOTSP AMQP Datasource Plugin
 */

(function(){

	freeboard.loadDatasourcePlugin({

		type_name : "Cisco-freeboard-plugin",

		display_name : "Cisco AMQP Data Broker",

		description : "A plugin to connect to the Cisco IoT Platform",

		external_scripts : [
			"plugins/iotsp-freeboard/stomp.js"	// required script for STOMP protocol
		],

		settings : [
			{
				name : 'server',
				displayName : 'Server',
				type : 'text',
				default_value: "52.201.225.106",
				description :"The server where your AMQP broker is running."
			},
			{
				name : 'exchange',
				displayName : 'Exchange Name',
				type : 'text',
				default_value: "4-EXC",
				description : 'The exchange you are subscribing to'
			},
			{
				name : 'routingKey',
				displayName : 'Routing Key',
				type : 'text',
				default_value: "dev2app",
				description : 'The routing key for the above exchange name.'
			},
			{
				name : 'virtualHost',
				displayName : 'Virtual Host',
				type : 'text',
				default_value: "IOTSP_INTERNAL",
				description : 'The virtual host for the AMQP broker.'
			},
			{
				name : 'username',
				display_name : 'Username',
				type : 'text',
				default_value: "dougn@cisco.com",
				description : 'Cisco IoT username.'
			},
			{
				name : 'password',
				display_name : 'password',
				type : 'text',
				default_value: "Iotsp$1234",
				description : 'Cisco IoT password'
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
		var stompClient;

		/**
		 * Callback function to getData
		 * @param stompFrame
		 */
		var onDataReceived = function(stompFrame){

			var objdata, data;

			console.info('stompFrame=' + JSON.stringify(stompFrame));

			if (stompFrame.body) {
				console.info("got message with body " + stompFrame.body);
				data = stompFrame.body;

				try {
					objdata = JSON.parse(data);
				} catch (e) {
					console.debug('Invalid JSON Received');
				}

				if (typeof objdata == "object") {
					updateCallback(objdata);
				} else {
					updateCallback(data);
				}

			} else {
				console.info('An Empty Message Received');
			}

		};

		/**
		 * Connection Success Handler
		 */
		var onConnect = function() {
			console.info("Stomp connection(%s) Opened", currentSettings.url);

			if(currentSettings.exchange != ""){
				//subscribe through an exchange
				stompClient.subscribe("/exchange/" + currentSettings.exchange + "/" + currentSettings.routingKey, onDataReceived);
			}

		};

		/**
		 * Connection Error Handler
		 * @param error
		 */
		var onError = function(error){
			console.log('an error happened on stomp connection', error);
		};

		/**
		 * Creates the stompClient connection
		 */
		function createConnection() {

			var sanitizedServer = currentSettings.server.replace(/.*?:\/\//g, "");  //remove all the protocols instances in a string

			var parser = document.createElement('a');
			parser.href = "http://" + sanitizedServer;

			parser.hostname; // => "10.10.4.5"
			parser.port;     // => "15674"
			parser.host;     // => "10.10.4.5:15674"

			if(parser.port == ""){
				parser.port = 15674;  //default rabbitmq webstomp port
			}

			var url = "ws://" + parser.hostname + ":" + parser.port + "/ws";

			//For Chrome, make sure protocol param is set as an empty array
			stompClient = Stomp.client(url, []);

			stompClient.connect(currentSettings.username, currentSettings.password, onConnect, onError, currentSettings.virtualHost);
		}


		/**
		 * A public function we must implement that will be called when a user makes a change to the settings.
		 * @param newSettings
		 */
		self.onSettingsChanged = function(newSettings) {
			currentSettings = newSettings;

			createConnection();
		};


		/**
		 * A public function we must implement that will be called when the user wants to manually refresh the datasource
		 */
		self.updateNow = function() {
			createConnection();
		};

		/**
		 * A public function we must implement that will be called when this instance of this plugin is no longer needed.
		 * Cleanup includes stompClient disconnect.
		 */
		self.onDispose = function() {
			stompClient.disconnect(function(){

				console.log('stomp disconnected');

			});
		};


		createConnection();
	};

}());