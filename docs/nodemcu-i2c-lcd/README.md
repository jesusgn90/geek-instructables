---
title: NodeMCU using LCD screen through I2C
lang: en-US
shareTags:
    - esp8266
    - nodemcu
    - lcd
    - i2c
---

<social-share />

# NodeMCU using LCD screen through I2C

For this tutorial we are using a `16x2 I2C LCD`, if your screen doesn't come with `I2C` adapter, you can buy a cheap adapter like [this](https://www.amazon.es/dp/B01MFB4743/ref=cm_sw_r_tw_dp_U_x_5Ln5Eb54DJ9P0).

### Minimal sketch for testing

Let's see a simple sketch to show how we can use this `LCD` screen thanks to `LiquidCrystal_I2C` library.

```c
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup()
{
  lcd.begin();
  lcd.backlight();  
  lcd.setCursor(0, 0);
  lcd.print("NodeMCU");
  lcd.setCursor(0, 1);
  lcd.print("Test");
}

void loop()
{

}
```

First of all, we include the library:

```c
#include <LiquidCrystal_I2C.h>
```

Declare the client (type `LiquidCrystal_I2C`). Set the LCD address to `0x27` for a `16` chars and `2` line display:

```c
LiquidCrystal_I2C lcd(0x27, 16, 2);
```

Using this library is based on cursor positions. We start at position `0,0`, then we print `NodeMCU`, now we set the position to `0,1` and print `Test`:

```c
lcd.begin();
lcd.backlight();  
lcd.setCursor(0, 0);
lcd.print("NodeMCU");
lcd.setCursor(0, 1);
lcd.print("Test");
```

Essentially, `lcd.setCursor(column, row)`. We have two rows with 16 positions per each row (16x2). Possibles rows would be `0-1` and possible columns `0-15`. Each column is a character. 

So the next two lines:

```c
lcd.setCursor(0, 0);
lcd.print("NodeMCU");
```

are using positions `0, 1, 2, 3, 4, 5, 6` (`N, o, d, e, M, C, U`) of row `0`.

### Diagram

<img class="image-center" src="/nodemcu-lcd/diagram.png" height="350" width="auto" >

See [LiquidCrystal_I2C](https://github.com/lucasmaziero/LiquidCrystal_I2C) for reference.

<Disqus/>