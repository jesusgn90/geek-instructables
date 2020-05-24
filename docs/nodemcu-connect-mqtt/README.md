---
title: NodeMCU and MQTT protocol
lang: en-US
shareTags:
    - esp8266
    - nodemcu
    - mqtt
    - mqttpublish
    - mqttbroker
    - mqttsubscribe
---

<social-share />

# NodeMCU and MQTT protocol

> MQTT (MQ Telemetry Transport or Message Queuing Telemetry Transport) is an open OASIS and ISO standard (ISO/IEC 20922) lightweight, publish-subscribe network protocol that transports messages between devices. 

Recommended reading: [MQTT (Wikipedia)](https://en.wikipedia.org/wiki/MQTT)

### How it works

We have three main actors:

- There is a *broker* server, which handles the messages from any client configured to use this broker server.
- A client (or more than one) which *publishes* messages related to certain *topics*.
- A client (or more than one) which *subscribes* to one or more *topics*.

Essentially, we can see this very similar to some social networks, you send a message including a hashtag (the topic) with some content (the message). Someone else, filters messages that include your hashtag (topic) and read the messages. But you actually don't care about the other person.

<img class="image-center" src="/nodemcu-connect-mqtt/example.png" height="auto" width="100%" >

_Image credits: [https://www.electronics-lab.com/](https://www.electronics-lab.com/community/index.php?/topic/47715-realtek-ameba-rtl8195-mqtt-demo/)_

### Configure Mosquitto as broker server and test it

Install `mosquitto` and `mosquitto-clients` in the broker server:

```sh
$ sudo apt install -y mosquitto mosquitto-clients
```

Configure a simple broker server:

```sh
$ cat /etc/mosquitto/mosquitto.conf 

# Default settings
pid_file /var/run/mosquitto.pid
persistence true
persistence_location /var/lib/mosquitto/
log_dest file /var/log/mosquitto/mosquitto.log
include_dir /etc/mosquitto/conf.d

# Added settings
listener 1884
allow_anonymous true
```

Now, in a different machine, install `mosquitto-clients`:

```sh
$ sudo apt install -y mosquitto-clients
```

From the broker server, subscribe to the topic `testTopic`:

```sh
$ mosquitto_sub  -v -t testTopic -p 1884
```

From the other machine, try to publish a message:

```sh
$ mosquitto_pub -t testTopic -m "Test message" -p 1884
```

The broker server should print this:

```sh
testTopic Test message
```

_Note: we are using the broker server to subscribe too, but it doesn't need to be the same machine, this is just for simplicity._

### Minimal sketch

Both the NodeMCU and the broker server must be connected to the same network, that's why we are going to connect our NodeMCU to a Wi-Fi network.

Let's see the full sketch first:

```c
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// Broker port
#define MQTT_PORT 1884
#define BAUD_RATE 9600

// Update these with values suitable for your network.
const char* ssid = "SSID";
const char* password = "WIFI_PASS";

// Broker address (Raspberry Pi address)
const char *mqtt_server = "192.168.1.132";

// Publish topic
const char* publish_topic = "outTopic";

// Subscribe topic
const char* subscribe_topic = "inTopic";

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi()
{

  delay(10);
  // We start by connecting to a WiFi network
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
  }
}

// Logic for arrived messages
void callback(char *topic, byte *payload, unsigned int length)
{
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++)
  {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void reconnect()
{
  // Loop until we're reconnected
  while (!client.connected())
  {
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    if (client.connect(clientId.c_str()))
    {
      client.subscribe(subscribe_topic);
    }
    else
    {
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup()
{
  Serial.begin(BAUD_RATE);

  // Configure Wi-Fi connection
  setup_wifi();

  // Configure broker server
  client.setServer(mqtt_server, MQTT_PORT);

  // Set callback for arrived messages
  client.setCallback(callback);
}

void loop()
{
  // Connect the MQTT client
  if (!client.connected())
  {
    reconnect();
  }
  client.loop();

  client.publish(publish_topic, "test message");
  delay(2000);
}
```

#### How the above sketch works

First of all, we include the required libraries:

```c
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
```

Now we declare some constant values and declare the clients:

```c
// Broker port
#define MQTT_PORT 1884
#define BAUD_RATE 9600

// Update these with values suitable for your network.
const char* ssid = "SSID";
const char* password = "WIFI_PASS";

// Broker address (Raspberry Pi address)
const char *mqtt_server = "192.168.1.132";

// Publish topic
const char* publish_topic = "outTopic";

// Subscribe topic
const char* subscribe_topic = "inTopic";

WiFiClient espClient;
PubSubClient client(espClient);
```

Notes:

- `192.168.1.132` must the be the broker server address.
- `outTopic` will be the used topic for publishing messages, those that the NodeMCU will send.
- `inTopic` will be the topic used for subscribing messages, those that we want to read in the NodeMCU.

The `setup_wifi` function is a helper function to connect to the Wi-Fi network.

Recommended reading: [NodeMCU connect to Wi-Fi](https://geekinstructables.com/nodemcu-connect-to-wifi/)

The `callback` function will be executed whenever the NodeMCU any message to any topic that it's subscribed to.

```c
// Logic for arrived messages
void callback(char *topic, byte *payload, unsigned int length)
{
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++)
  {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}
```

The `reconnect` function is a helper function to connect the NodeMCU to the MQTT broker server.

Inside the `setup` function we connect to the Wi-Fi network, configure the MQTT broker server and configure the arrived messages callback.

```c
void setup()
{
  Serial.begin(BAUD_RATE);

  // Configure Wi-Fi connection
  setup_wifi();

  // Configure broker server
  client.setServer(mqtt_server, MQTT_PORT);

  // Set callback for arrived messages
  client.setCallback(callback);
}
```

Finally, the `loop` function checks if our MQTT client is already connected (the first time it won't be connected), if it's not connected, it calls `reconnect`. Then, it invokes the internal client `loop` and then it publish a message using the `outTopic` topic and `test message` as content.

```c
void loop()
{
  // Connect the MQTT client
  if (!client.connected())
  {
    reconnect();
  }
  client.loop();

  client.publish(publish_topic, "test message");
  delay(2000);
}
```

### Read the messages sent by the NodeMCU in our computer

Using the above sketch, our NodeMCU will a message every 2 seconds using the `outTopic` topic and `test message` as content for the message.

Subscribe to `outTopic` topic in your computer:

```sh
$ mosquitto_sub  -v -t outTopic -p 1884
```

Now you should start to see this ever two seconds:

```
outTopic test message
outTopic test message
outTopic test message
outTopic test message
...
```

### Read the messages sent by our computer in our NodeMCU

Using the above sketch, our NodeMCU is subscribed to messages from `inTopic` topic, so if you send a message using that topic from any machine connected to the broker server, you'll see that message in the serial monitor of your NodeMCU.

To send a message from your computer:

```sh
$ mosquitto_pub -t inTopic -m "Test message from computer" -p 1884
```

<Disqus/>