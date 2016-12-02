# Diagnosing issues with your IoT Hub

This tool is provided to help diagnose issues with a device connecting to Azure IoT Hubs.

<a name="prerequisites"/>
## Prerequisites
=======
 - For instructions installing node.js refer to [node.js](https://nodejs.org).
 - Iothub-Diagnostics relies on native addons compiled with node-gyp, for instructions installing node-gyp see the node-gyp installation [instructions](https://github.com/nodejs/node-gyp#installation).

<a name="install"/>
## Install

> Note: This tool requires Node.js version 4.x or higher for all features to work.

To install the latest (pre-release) version of the **iothub-diagnostics** tool run the following command in your command line environment:

```shell
npm install -g iothub-diagnostics
```
<a name="execution"/>
## Execution

To run the tool, from your command prompt execute the following command: 

```shell
node index HostName=<my-hub>.azure-devices.net;SharedAccessKeyName=<my-policy>;SharedAccessKey=<my-policy-key>
```

> Note: See [Set up IoT Hub](../../doc/setup_iothub.md) for information about how to retrieve your IoT hub connection string.

```shell
2016-10-27T23:34:46.408Z - info: *******************************************
2016-10-27T23:34:46.411Z - info: * Executing the Microsoft IOT Trace tool. *
2016-10-27T23:34:46.411Z - info: *******************************************
2016-10-27T23:34:46.412Z - info: 
2016-10-27T23:34:46.412Z - info: --- Executing network tests ---
2016-10-27T23:34:46.430Z - info: 
2016-10-27T23:34:46.430Z - info: Starting DNS resolution for host 'www.microsoft.com'...
2016-10-27T23:34:46.439Z - info: --> Successfully resolved DNS to 23.74.65.35.
2016-10-27T23:34:46.439Z - info: 
2016-10-27T23:34:46.439Z - info: Pinging IPV4 address '23.74.65.35'...
2016-10-27T23:34:46.444Z - info: --> Successfully pinged 23.74.65.35
2016-10-27T23:34:46.444Z - info: 
2016-10-27T23:34:46.444Z - info: Starting TraceRoute to 23.74.65.35...
2016-10-27T23:34:46.462Z - info: --> Traceroute completed.
2016-10-27T23:34:46.462Z - info: 
2016-10-27T23:34:46.462Z - info: Sending https request to 'https://www.microsoft.com/'
2016-10-27T23:34:46.637Z - info: --> Completed https request
2016-10-27T23:34:46.637Z - info: 
2016-10-27T23:34:46.637Z - info: --- Executing IOT Hub tests ---
2016-10-27T23:34:55.747Z - info: 
2016-10-27T23:34:55.748Z - info: Starting AMQP Test...
2016-10-27T23:35:00.487Z - info: --> Successfully ran AMQP test.
```
  
The tool will run, and will provide high level information about success and failure to the command prompt. Specifically it will:

1. It will attempt a DNS lookup, Ping, Traceroute and Https request to microsoft.com
  * If ping and DNS resolution fail, then you should troubleshoot the devices connectivity to the internet.
  * If the DNS resolution is successful, but the Https test fails, it is possible that you do not support the correct cipher suite. See (here)[https://azure.microsoft.com/en-us/documentation/articles/iot-hub-security-deployment/] for information about supported Cipher Suites.
  * Note - if the ping fails, but the other network tests succeed, then its possible ping is disabled on your network (the tool will still run other tests if ping fails). 
2. Attempt to use the Azure IOT SDK to communicate with the service.
  * If all four tests fail, then first you should verify that the credentials you are using are correct.
  * If the Https and websockets tests are successful, but the AMQP and MQTT tests fail then you should investigate if the ports for AMQP (5672) and/or  MQTT (1833) are blocked.
  * If all of the tests are successful but you are not using the Microsoft Iot SDK then that would indicate a possible client side software bug.

<a name="frequenterrors"/>
## Frequent Errors

- `SyntaxError: Use of const in strict mode.` - Upgrade your version of node.js to at least 4.x.
- `Failed at the raw-socket@1.5.0 install script 'node-gyp rebuild'.` - Node-Gyp is not properly configured, see the node-gyp installation [instructions](https://github.com/nodejs/node-gyp#installation).
- `Unable to parse the connection string. ArgumentError: ...` - There was a problem parsing your connection string, verify that the value is correct the message should give informaiton about what is wrong with the supplied value.

=======
