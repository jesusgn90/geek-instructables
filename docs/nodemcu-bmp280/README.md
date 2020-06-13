---
title: NodeMCU reading barometric pressure sensor
lang: en-US
shareTags:
    - esp8266
    - nodemcu
    - pressure
    - hpa
---

<social-share />

# NodeMCU reading barometric pressure sensor

For this tutorial we are using the `BMP280` sensor, see details [here](https://www.bosch-sensortec.com/products/environmental-sensors/pressure-sensors/pressure-sensors-bmp280-1.html#technical).

### Minimal sketch for testing

Let's see a simple sketch to show how we can use this barometric pressure sensor.

```c
#include <Adafruit_BMP280.h> 
 
// Using 0x77 implies both CSB and SDO are connected to 3V3!
#define BMP280_I2C_ADDRESS  0x77

// initialize Adafruit BMP280 library
Adafruit_BMP280  bmp280;
 
void setup(void)
{
  Serial.begin(9600);
  delay(1000);
 
  /**
   * SDA connected to NodeMCU D2 pin, which is GPIO4
   * SCL connected to NodeMCU D1 pin, which is GPIO5
   */
  Wire.begin(4, 5);
  
  // initialize the BMP280 sensor
  while (bmp280.begin(BMP280_I2C_ADDRESS) == 0)
  {  // connection error or device address wrong!
    Serial.println("Could not initialize sensor, retrying now...");
    delay(1000);
  }
}
 
void loop()
{
  float pressure = bmp280.readPressure() / 100.0F;
 
  Serial.print("Pressure = ");
  Serial.print(pressure);
  Serial.println(" hPa");
 
  delay(1000);  
}
```

First of all, we include the library:

```c
#include <Adafruit_BMP280.h> 
```

This sensor can use `I2C` protocol, in our example, the address will be `0x77` so you must connect `CSB` and `SDO` pins to some of the `3V3` pins:

```c
#define BMP280_I2C_ADDRESS  0x77
```

Declare the client (type `Adafruit_BMP280`):

```c
Adafruit_BMP280  bmp280;
```

The setup is pretty simple, just wait until our NodeMCU finds the address. `SDA` connected to NodeMCU `D2` pin, which is `GPIO4` and `SCL` connected to NodeMCU `D1` pin, which is `GPIO5`:

```c
Wire.begin(4, 5);

while (bmp280.begin(BMP280_I2C_ADDRESS) == 0)
{
    Serial.println("Could not initialize sensor, retrying now...");
    delay(1000);
}
```

Finally, read the pressure and print it through the serial monitor:

```c
float pressure = bmp280.readPressure() / 100.0F;

Serial.print("Pressure = ");
Serial.print(pressure);
Serial.println(" hPa");
```

That's all. As you can see, it's pretty simple.

### Diagram

<img class="image-center" src="/nodemcu-bmp280/diagram.png" height="350" width="auto" >

<Disqus/>