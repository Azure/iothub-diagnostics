# This Repo is currently Archived and will no longer be under development

# Diagnosing issues with your IoT Hub

This tool is provided to help diagnose issues with a device connecting to Azure IoT Hubs.

## Prerequisites

 - For instructions installing node.js refer to [node.js](https://nodejs.org).

## Install

> Note: This tool requires Node.js version 4.x or higher for all features to work.

To install the latest version of the **iothub-diagnostics** tool run the following command in your command line environment:

```shell
npm install -g iothub-diagnostics
```

## Usage

```shell
iothub-diagnostics [hub connection string]

Options:
  --version            Show version number                             [boolean]
  -h, --help           Show help                                       [boolean]
  -d, --device         use the specified device id (Symmetric Key authentication
                       only)
  -g, --consumerGroup  consumer group to use on the Event-hubs compatible
                       endpoint
```

## Execution

To run the tool, from your command prompt execute the following command on windows:

```shell
> iothub-diagnostics HostName=<my-hub>.azure-devices.net;SharedAccessKeyName=<my-policy>;SharedAccessKey=<my-policy-key>
```

or on Linux (it's the same command, but there are quotes around the connection string because `;` marks the end of a a command in bash:


```shell
$ iothub-diagnostics "HostName=<my-hub>.azure-devices.net;SharedAccessKeyName=<my-policy>;SharedAccessKey=<my-policy-key>"
```

> Note: See [Set up IoT Hub](../../doc/setup_iothub.md) for information about how to retrieve your IoT hub connection string.

The tool will run, and will provide high level information about success and failure to the command prompt. Specifically it will:

1. It will attempt a DNS lookup, Ping and Https request to microsoft.com
    * If ping and DNS resolution fail, then you should troubleshoot the devices connectivity to the internet.
    * If the DNS resolution is successful, but the Https test fails, it is possible that you do not support the correct cipher suite. See (here)  [https://azure.microsoft.com/en-us/documentation/articles/iot-hub-security-deployment/] for information about supported Cipher Suites.
    * Note - if the ping fails, but the other network tests succeed, then its possible ping is disabled on your network (the tool will still run other tests if ping fails).
2. Attempt to use the Azure IoT Hub and Event Hubs SDKs to run more tests:
    * If a device id is specified using the `--device` option it will look for an existing device with this device id in the registry:
      * if it finds a device:
        * if a device with this device id is connected, it will fail (in order to not disconnect the existing running device)
        * if this device identity is disabled, it will fail (and you must enable this device first)
      * if it does not find a device, it will create a device either with the specified device id or with a randomly generated one if none has been specified.
      * If the device lookup or creation fails, it's highly likely that the connection string passed to iothub-diagnostics is invalid.
    * It will then connect a listener on the Event-Hubs compatible endpoint and start testing that the created device identity can be connected using the 5 supported protocols: AMQP, AMQP/WS, HTTP,   MQTT and MQTT/WS.
      * If all of the five protocol tests fail, there might be an issue with the device identity, maybe with another device using it and trying to reconnect at the same time.
    * If the Https and websockets tests are successful but the AMQP and MQTT tests fail then you should investigate if the ports for AMQP (5671) and/or  MQTT (8883) are blocked.
    * If all of the tests are successful, congratulations, your network fully supports all protocols used by devices to connect to IoT Hub and your hub connection string is valid!

### Options

- By default, `iothub-diagnostics` uses the `$Default` consumer group. you can use the `--consumerGroup` option to give it another consumer group if necessary.
- You can specify a device identity to use for the tests by using the `--device` option. If the device identity exists, it must use symmetric keys. If it does not it will be created. If the `--deviceId` option is not used, a temporary test device identity is created and deleted after the tests.
- the `--help` option contains directions on how to use `iothub-diagnostics`

This is what the output of a successful run will look like:

```shell
C:\forks>iothub-diagnostics %IOTHUB_CONNECTION_STRING%
2018-09-02T05:36:49.137Z - info: *******************************************
2018-09-02T05:36:49.145Z - info: * Executing the Microsoft IOT Trace tool. *
2018-09-02T05:36:49.147Z - info: *******************************************
2018-09-02T05:36:49.149Z - info:
2018-09-02T05:36:49.151Z - info: --- Executing network tests ---
2018-09-02T05:36:49.210Z - info:
2018-09-02T05:36:49.213Z - info: Starting DNS resolution for host 'www.microsoft.com'...
2018-09-02T05:36:49.234Z - info: --> Successfully resolved DNS to 23.45.229.117.
2018-09-02T05:36:49.236Z - info:
2018-09-02T05:36:49.238Z - info: Pinging IPV4 address '23.45.229.117'...
2018-09-02T05:36:49.293Z - info: --> Successfully pinged 23.45.229.117
2018-09-02T05:36:49.297Z - info:
2018-09-02T05:36:49.300Z - info: Sending https request to 'https://www.microsoft.com/'
2018-09-02T05:36:49.426Z - info: --> Completed https request
2018-09-02T05:36:49.430Z - info:
2018-09-02T05:36:49.432Z - info: --- Executing IOT Hub tests ---
2018-09-02T05:36:56.366Z - info:
2018-09-02T05:36:56.370Z - info: Starting AMQP Test...
2018-09-02T05:37:01.575Z - info: --> Successfully ran AMQP test.
2018-09-02T05:37:01.582Z - info:
2018-09-02T05:37:01.594Z - info: Starting AMQP/WS Test...
2018-09-02T05:37:07.000Z - info: --> Successfully ran AMQP/WS test.
2018-09-02T05:37:07.021Z - info:
2018-09-02T05:37:07.023Z - info: Starting HTTPS Test...
2018-09-02T05:37:11.915Z - info: --> Successfully ran HTTPS test.
2018-09-02T05:37:11.958Z - info:
2018-09-02T05:37:11.961Z - info: Starting MQTT Test...
2018-09-02T05:37:16.141Z - info: --> Successfully ran MQTT test.
2018-09-02T05:37:16.152Z - info:
2018-09-02T05:37:16.158Z - info: Starting MQTT/WS Test...
2018-09-02T05:37:26.441Z - info: --> Successfully ran MQTT/WS test.
```

## Frequent Errors

- `SyntaxError: Use of const in strict mode.` - Upgrade your version of node.js to at least 4.x.
- `Unable to parse the connection string. ArgumentError: ...` - There was a problem parsing your connection string, verify that the value is correct the message should give informaiton about what is wrong with the supplied value.
