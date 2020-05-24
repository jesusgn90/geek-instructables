---
title: NodeMCU deep sleep mode
lang: en-US
shareTags:
    - esp8266
    - nodemcu
    - deepsleep
---

<social-share />

# NodeMCU deep sleep mode

Using a battery is always a cool way to supply our board, however, batteries have a limited duration. If our board doesn't need to be running permanently, why we should keep it wasting battery? Here is where deep sleep mode helps us.

### How it works

Once the device enters deep sleep mode, it turns off almost every inner component. This mode can be configured using a timer so it wakes itself up after a predefined period of time or using an external wake up so it wakes up when you press the `RST` (reset) button.

### Example

For our example, we are going to use the timer mode. This means the device will sleep for a predefined amount of time and then it'll wake itself up. 

<img class="image-center" src="/nodemcu-deep-sleep/diagram.png" height="250" width="auto" >

The `GPIO16` (`D0`) pin connected to `RST` pin, will simulate the _"press the RST button"_ action so we don't need to press the button each time the device should wake up.

Recommended reading: [NodeMCU Pinout Reference](https://components101.com/development-boards/nodemcu-esp8266-pinout-features-and-datasheet)

#### Sketch for testing deep sleep mode

```c
// Baud rate
#define BAUD_RATE 9600

void setup()
{
  Serial.begin(BAUD_RATE);
  
  Serial.println("Hello from setup()");
  Serial.println("Going to sleep 10s");

  //doSomething();
  
  // 10 * 1000000us = 10s
  ESP.deepSleep(10 * 1000000);
}

void loop()
{
  
}
```

When using deep sleep mode, our `loop` block doesn't make sense because the device will shutdown itself once it reach the line `ESP.deepSleep(...)`. That's why you should do any action (or call it) inside the `setup` block and before the `ESP.deepSleep(...)`.

The `setup` block should look like this:

```c
void setup()
{
    // Init things. 
    // e.g: connect to Wi-Fi

    // Do something. 
    // e.g: read sensor and send data

    // Sleep
}
```

The function `ESP.deepSleep` uses `μs` as unit, so you have to multiply the amount of seconds by 1000000. E.g: if you want to sleep for 20 seconds, you'll need `ESP.deepSleep(20 * 1000000);`

A typical use case is about reading current temperature and humidity, send the data to somewhere else and go to sleep every hour.

Recommended sketch: [MQTT + Wi-Fi + DHT11 + Deep Sleep](https://github.com/jesusgn90/nodemcu-examples/blob/master/MQTT-WIFI-DHT11/mqtt-wifi-dht11-deep-sleep.ino)

### About powerbanks

There is a known problem with this kind of battery, most of them come with a preventive measure so it auto-turns itself off when there is no connected device. Once our NodeMCU is in deep sleep mode, it uses to consume about `0.04mA` (from my readings), so the power bank thinks there is no connected device. To solve this you have several options:

- Modify the power bank to bypass this limitation.
- Extract the batteries from the power bank and use them as it.
- Use a power bank designed for IoT devices, they can be configured to avoid this behavior.
- Use a different kind of battery :smile:.

<Disqus/>