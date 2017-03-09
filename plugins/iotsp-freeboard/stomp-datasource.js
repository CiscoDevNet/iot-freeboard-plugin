/**
 * @author hienng
 * @description Cisco IOTSP AMQP Datasource Plugin
 */

(function(){

	freeboard.loadDatasourcePlugin({

		type_name : "Cisco-freeboard-plugin",

		display_name : "Cisco AMQP Data Broker",

		description : "A plugin to connect to the Cisco IoT Data Connect Platform",

		external_scripts : [
			"plugins/iotsp-freeboard/stomp.js"	// required script for STOMP protocol
		],

		settings : [
			{
				name : 'server',
				displayName : 'Server',
				type : 'text',
				default_value: "localhost",
				description :"The server where your AMQP broker is running."
			},
			{
				name : 'exchange',
				displayName : 'Exchange Name',
				type : 'text',
				default_value: "TEST-EXC",
				description : 'The exchange you are subscribing to'
			},
			{
				name        : "match",
				display_name: "Filter Match",
				type        : "option",
				options			: [
					{
						name: "Match All",
						value: "all"
					},
					{
						name: "Match Any",
						value: "any"
					}
				],
				description : 'Match All Filters or Match Any Filters?'
			},
			{
				name : 'filters',
				displayName : "Filters",
				type : 'array',
				settings    : [
					{
						name        : "key",
						display_name: "Filter Name",
						type        : "text"
					},
					{
						name        : "value",
						display_name: "Filter Value",
						type        : "text"
					}
				],
				description : 'Filters for messages coming into your exchange.'
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
				default_value: "guest",
				description : 'Cisco IoT Data Connect username.'
			},
			{
				name : 'password',
				display_name : 'password',
				type : 'password',  //changed to password type instead of text
 				default_value: "",
				description : 'Cisco IoT Data Connect password'
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

			var objdata, data, headers;

			if (stompFrame.body) {

				headers = stompFrame.headers;
				data = stompFrame.body;

				var headersMap = {};
				for (var p in headers) {
					if( headers.hasOwnProperty(p) ) {
						if(p != "content-length" && p != "redelivered" && p != "subscription" && p !="message-id" && p != "destination" && p != "persistent"){
							headersMap[p] = headers[p];
						}
					}
				}

				var userFilters = currentSettings.filters;

				if(userFilters && userFilters.length > 0) {
					var match = 0;

					for (var i = 0; i < userFilters.length; i++) {
						for (var p in headersMap) {
							if (userFilters[ i ].key == p && userFilters[ i ].value == headersMap[ p ]) {
								match++;
							}
						}
					}

					if (currentSettings.match == "all") {
						if (userFilters.length == match) {
							try {
								console.info ('stompFrame=' + JSON.stringify (stompFrame));
								objdata = JSON.parse (data);
							}
							catch (e) {
								objdata = {
									"Invalid Data Received": "We cannot parse this, please check your data format."
								};
								console.debug ('Invalid JSON Received');
							}

							if (typeof objdata == "object") {
								updateCallback (objdata);
							} else {
								updateCallback (data);
							}
						}
					}

					if (currentSettings.match == "any") {
						if (match > 0) {
							try {
								console.info ('stompFrame=' + JSON.stringify (stompFrame));
								objdata = JSON.parse (data);
							}
							catch (e) {
								objdata = {
									"Invalid Data Received": "We cannot parse this, please check your data format."
								};
								console.debug ('Invalid JSON Received');
							}

							if (typeof objdata == "object") {
								updateCallback (objdata);
							} else {
								updateCallback (data);
							}
						}
					}
				}
				else{
					console.info ('stompFrame=' + JSON.stringify (stompFrame));
					try {
						objdata = JSON.parse (data);
					}
					catch (e) {
						objdata = {
							"Invalid Data Received": "We cannot parse this, please check your data format."
						};
						console.debug ('Invalid JSON Received');
 					}

					if (typeof objdata == "object") {
						updateCallback (objdata);
					} else {
						updateCallback (data);
					}
				}
			}
			else {
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
				stompClient.subscribe("/exchange/" + currentSettings.exchange + "/" + currentSettings.routingKey , onDataReceived);
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

			//Removes all the protocol instances from the server
			var sanitizedServer = currentSettings.server.replace(/.*?:\/\//g, "");  //remove all the protocols instances in a string

			var parser = document.createElement('a');
			parser.href = "http://" + sanitizedServer;

			parser.hostname; // => "10.10.4.5"
			parser.port;     // => "15674"
			parser.host;     // => "10.10.4.5:15674"

			if(parser.port == ""){
				//parser.port = 15674;  //default rabbitmq webstomp port
				parser.port = 15673; //default rabbitmq webstomp port for TLS
			}

			var url = "wss://" + parser.hostname + ":" + parser.port + "/ws";

			//For Chrome, make sure protocol param is set as an empty array
			stompClient = Stomp.client(url, []);

			var headers = {
				"login": currentSettings.username,
				"passcode": currentSettings.password,
				// additional header
				"host": currentSettings.virtualHost
			};

			//stompClient.connect(currentSettings.username,currentSettings.password, onConnect, onError, currentSettings.virtualHost);
			stompClient.connect(headers, onConnect, onError);
		}


		/**
		 * A public function we must implement that will be called when a user makes a change to the settings.
		 * @param newSettings
		 */
		self.onSettingsChanged = function(newSettings) {
			currentSettings = newSettings;

			//When settings changed, disconnect existing connection and recreate a new one.
			stompClient.disconnect(function(){

				console.log('stomp disconnected');

			});
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