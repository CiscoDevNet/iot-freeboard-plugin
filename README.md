# cisco-freeboard-plugin
A basic example of WebSocket plugin to freeboard.io to fetch data from Cisco IoT Data Connect AMQP Pipeline.
 
## Getting Started 
You have multiple options to use Cisco AMQP Data Broker plugin. You can use it as a new **Standalone Freeboard Instance** or just add the **Cisco AMQP Data Broker datasource to your existing Freeboard instance**.  

The two methods are covered below.

## OPTION 1: Add Cisco AMQP Data Broker datasource to your existing Freeboard Instance.

### Prerequisite
You must already have an existing Freeboard instance running on your server and serving up the freeboard's index.html page.

1.  Clone this repository [cisco-freeboard-plugin](https://cto-github.cisco.com/IOTSP/cisco-freeboard-plugin.git)
2.  Open the plugins directory and copy the content of **plugins/iotsp-freeboard/** directory over to your existing Freeboard **plugins/ **directory
3.  Edit **index.html** and **index-dev.html** and look for **// *** Load more plugins here *****
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
    
 4. Copy our **lib/js/freeboard/FreeboardModel.js** over to your Freeboard **lib/js/freeboard/FreeboardModel.js** instance. 
    **In our code, we have fixed a Firefox bug where Save Dashboard failed in Firefox.**
    If you are running an older version of Freeboard.io, please update the above file so you can use **Save Dashboard ** functionality in Freeboard.io
 5. Re-run grunt to regenerate all the files.
 6. Open up index.html in the browser and start using Freeboard.
 
 
## OPTION 2: Install a standalone Freeboard instance.

### Prerequisite 

If you already have Node.JS or NPM, please proceed to the next step.

1.  Install NodeJS and NPM if you don't already have it.  https://nodejs.org/en/download/

2.  Install Homebrew if you don't already have it:

    `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`

## How to configure Freeboard DataSource

Please go here for detailed instruction on how to configure the Datasource.  https://learninglabs.cisco.com:8867/lab/iot-data-connect-301/step/1




 