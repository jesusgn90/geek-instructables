---
title: NodeMCU connect to Wi-Fi
lang: en-US
shareTags:
    - esp8266
    - nodemcu
    - wifi
---

<social-share />

# NodeMCU connect to Wi-Fi

Connecting the NodeMCU board to a Wi-Fi network is as simple as using the library [ESP8266WiFi](https://github.com/esp8266/Arduino/blob/master/libraries/ESP8266WiFi/src/ESP8266WiFi.h).

### Minimal sketch for testing

Let's see a simple sketch to show how we can connect to a Wi-Fi network using this library.

```c
#include <ESP8266WiFi.h>

const char* ssid = "REPLACE_SSID";
const char* password = "REPLACE_WIFI_PASS";

WiFiClient espClient;

void setup_wifi() {
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void setup() {
  setup_wifi();
}

void loop() {

}
```

First of all, we include the library:

```c
#include <ESP8266WiFi.h>
```

Define the network credentials:

```c
const char* ssid = "REPLACE_SSID";
const char* password = "REPLACE_WIFI_PASS";
```

Declare the client (type `WiFiClient`):

```c
WiFiClient espClient;
```

Helper function to setup the client:

```c
void setup_wifi() {
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}
```

- Initialize the client using `begin` function.
- While the client is not connected, wait 500ms (note that this might be an infinite loop!).

Finally, call the previous helper function from the `setup` function:

```c
void setup() {
  setup_wifi();
}
```

That's all. As you can see, it's pretty simple.

### Useful functions from Wi-Fi library

If you want to know the IP address, you can call `WiFi.localIP()`.

```c
Serial.println("IP address: ");
// Print assigned IP
Serial.println(WiFi.localIP());
```

Prevent from being an access-point using `WiFi.mode(WIFI_STA)`:

```c
/** 
 * Explicitly set the ESP8266 to be a WiFi-client, otherwise, it by default,
 * would try to act as both a client and an access-point and could cause
 * network-issues with your other WiFi-devices on your WiFi-network. 
 */
WiFi.mode(WIFI_STA);
```

You can also disconnect from the network using `WiFi.disconnect()`.

```c
// Disconnect from current network
WiFi.disconnect()
```