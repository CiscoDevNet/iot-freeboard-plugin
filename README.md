# cisco-freeboard-plugin
A basic example of WebSocket plugin to freeboard.io to fetch data from Cisco IOTSP data pipeline.


## WebSockets
If you are not familiar with HTML5 WebSockets, please check them out [here](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API).  WebSockets basically allows you to specify an endpoint on a server (which must support WebSocket connections to that endpoint) and a WebSocket connection will be negotiated on through an simple HTTP exchange.  After an HTTP handshake has been made, a WebSocket connection between client and server is established on the appropriate port.  After that, messages can be exchanged from client to server.  
A benefit of WebSocket connections is the ability to allow servers to arbitrarily push data to client.  This arbitrary pushing of data was necessary to satisfy our real-time goals to visualize observation data coming out of the IOTSP data pipeline through the use of Freeboard.io, as we wanted to minimize bandwidth and have updates on clients as quickly as possible (constant polling from the clients would waste bandwidth and resources).
Because of the asynchronous nature of Javascript, these sends and receives are not blocking. The great utility for web applications lies in this fact; registering a function to be called whenever some new data comes in allows your application to react immediately to new data from the server, without having to make an AJAX request to get the data.

 
##RabbitMQ
RabbitMQ is an open source message broker middleware that implements the Advanced Message Queuing Protocol (AMQP).  RabbitMQ messaging broker gives your applications a common platform to send and receive messages.  Messages in queue are live until received.  The default RabbitMQ username is guest and password is guest.  You can set your own user accounts on RabbitMQ.  To integrate with GwaaS, you would need to sign up for GwaaS account, this will be your RabbitMQ username and password.

Messages are routed through exchanges before arriving at queues. User can provide a specific queue or an exchange that can be bound to a queue.  Please find out what queue and/or exchanges you are interested in before trying to use this Plugin.  You will be prompted to provide a queue name or exchange name during the plugin initialization.

###Exchanges
A producer is a user application that sends messages.
A queue is a buffer that stores messages.
A consumer is a user application that receives messages.

The producer can only send messages to an exchange. An exchange is a very simple thing. On one side it receives messages from producers and the other side it pushes them to queues. The exchange must know exactly what to do with a message it receives. Should it be appended to a particular queue? Should it be appended to many queues? Or should it get discarded.  In our plugin, we need a direct exchange name from the user.  Once connected, we will create and bind to an auto-deleted queue where it will receive messages from the producer.  

 
## RabbitMQ
RabbitMQ is an open source message broker middleware that implements the Advanced Message Queuing Protocol (AMQP).  RabbitMQ messaging broker gives your applications a common platform to send and receive messages.  Messages in queue are live until received.  The default RabbitMQ username is guest and password is guest.  You can set your own user accounts on RabbitMQ.  To integrate with GwaaS, you would need to sign up for GwaaS account, this will be your RabbitMQ username and password.
Messages are routed through exchanges before arriving at queues. User can provide a specific queue or an exchange that can be bound to a queue.  

Please find out what queue and/or exchanges you are interested in before trying to use this Plugin.  You will be prompted to provide a queue name or exchange name during the plugin initialization.

### Exchanges
A producer is a user application that sends messages.

A queue is a buffer that stores messages.

A consumer is a user application that receives messages.

The producer can only send messages to an exchange. An exchange is a very simple thing. On one side it receives messages from producers and the other side it pushes them to queues. The exchange must know exactly what to do with a message it receives. Should it be appended to a particular queue? Should it be appended to many queues? Or should it get discarded.  

In our plugin, we need a direct exchange name from the user.  Once connected, we will create and bind to an auto-deleted queue where it will receive messages from the producer. 
 
## Getting Started 
You have multiple options to use Cisco IoT Freeboard plugin. You can use it as a new standalone Freeboard instance or just add the Cisco IoT datasource to your existing Freeboard instance.  The two methods are covered below.


## Add Cisco IoT datasource to your existing Freeboard Instance.

### Prerequisite
You must already have an existing Freeboard instance running on your server.

1.  Clone this repository [cisco-freeboard-plugin](https://cto-github.cisco.com/IOTSP/cisco-freeboard-plugin.git)
2.  Open the plugins directory and copy the content of plugins/iotsp-freeboard/ directory over to your existing Freeboard plugins/ directory
3.  Edit index.html and index-dev.html and look for // *** Load more plugins here ***
    Then, add this line **"plugins/iotsp-freeboard/stomp-datasource.js"** under // *** Load more plugins here ***

    Example from index.html
    ~~~~
    head.js("js/freeboard_plugins.min.js",
                    "plugins/jqplot/index.js",
                    // *** Load more plugins here ***
                    "plugins/iotsp-freeboard/stomp-datasource.js",
                    
                    function(){
                        $(function()
                        { //DOM Ready
                            freeboard.initialize(true);
    
                            var hashpattern = window.location.hash.match(/(&|#)source=([^&]+)/);
                            if (hashpattern !== null) {
                                $.getJSON(hashpattern[2], function(data) {
                                    freeboard.loadDashboard(data, function() {
                                        freeboard.setEditing(false);
                                    });
                                });
                            }
                        });
                    });
    ~~~~
    
 4. Copy our lib/js/freeboard/FreeboardModel.js over to your Freeboard lib/js/freeboard/FreeboardModel.js instance. In our code, we have fixed a Firefox bug where Save Dashboard failed in Firefox.
 5. Re-run grunt to regenerate all the files.
 6. Open up index.html in the browser and start using Freeboard.
 
 
## Install a standalone Freeboard instance.

### Prerequisite 

1.  Install NodeJS and NPM if you don't already have it.  https://nodejs.org/en/download/

2.  Install Homebrew if you don't already have it:

    `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`


    You should be using a data broker that your company provides.  

    However, if you don't have one and want to set one up locally, you can do so by the following
    
## Setup a local RabbitMQ server

### Install the RabbitMQ Server

Before installing make sure you have the latest brews:

`brew update`
 
Then, install RabbitMQ server with:

`brew install rabbitmq`
 
Run the RabbitMQ server

`/usr/local/sbin/rabbitmq-server`
 
Install rabbitmq_web_stomp plugins
 
 `/usr/local/sbin/rabbitmq-plugins enable --online rabbitmq_web_stomp`
 
The main intention of Web-Stomp is to make it possible to use RabbitMQ from web browsers.
By default the Web STOMP plugin exposes both a WebSocket and a SockJS endpoint on port 15674. The WebSocket endpoint is available on the /ws path

On the browser, you can see your own RabbitMQ server via: http://localhost:15672/  (credential: guest/guest)
In code, your web socket RabbitMQ url will be:  ws://localhost:15674/ws
 
3.  Clone this repository [cisco-freeboard-plugin](https://cto-github.cisco.com/IOTSP/cisco-freeboard-plugin.git)

4.  Install the package and dependencies:

    `npm install`
 
5.  Start the Freeboard.io web server
    `grunt`
    
    If grunt fails, you may need to run `sudo npm install grunt-cli` and then run `grunt` again after it finished.

6. Open up index.html in the browser and start using Freeboard.


## How to configure Freeboard DataSource
Please locate the Data Broker configuration information in GwaaS portal under Organization >> Data Delivery >> AMQP Broker Details.

1.  Under DataSource >> Click Add
2.  Select **Cisco AMQP Data Broker**
3.  Name the dataSource anything you like (ie: cisco)
4.  Fill out the **Server**.  This is the hostname of where your RabbitMQ broker is.  If you don't specify a port number for the server, we assume it's the standard port **15674** for WebSocket.  
5.  Fill out the **Exchange Name**
6.  Fill out the **Routing Key**
7.  Fill out the **Virtual Host**
8.  The **username** to login the the broker
9.  The **password** to login to the broker.
10. Click Save



 