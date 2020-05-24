---
title: Expose local service (SSH tunnel)
lang: en-US
shareTags:
    - ssh
    - sshtunnel
    - aws
    - raspberrypi
---

<social-share />

# Expose local service (SSH tunnel)

Somehow, you need to expose a local service to the Internet such a webservice running in a Raspberry Pi. However, you are not able
to do it on usual ways such as static IP address or DynDNS due to whatever reason or simply, you just want to make your own [Ngrok](https://ngrok.com/) like system.

### Requirements

- Device with the webservice expected to be exposed. For our example, a Raspberry Pi 3B+ with Internet access connected to our router (it's in our local network). About $35.
- External server with static address. For our example, an AWS t2.nano instance with Ubuntu server 18.04 installed. About $5/month.
- Custom domain, for our example, example.com
- Optionally, you may want to use a laptop to make things from here using SSH, but you don't really need it.
- A little bit of Linux and networking knowledge.

### Server | AWS t2.nano instance
 
Security groups:

- Inbound
  - HTTP/TCP 80 from everywhere (0.0.0.0)
  - SSH/TCP 22 from everywhere (0.0.0.0)
- Outbound
  - All

#### Install NGINX

Update the apt packages, install NGINX, enable the NGINX service, start the NGINX service.

```sh
$ sudo apt update
$ sudo apt install nginx
$ sudo systemctl enable nginx
$ sudo systemctl start nginx
```

#### Configure NGINX

Create a server file to listen to our subdomain on port 80 (default):

```sh
$ sudo touch /etc/nginx/sites-enabled/example-server
```

Use a text editor such as `vi` or `nano` and copy and paste the next configuration, once done, save and exit:

```nginx
server {
    # Our subdomain, change with your own
    server_name foo.example.com;

    # Log file location
    access_log /var/log/nginx/$host;

    location / {
        # Where to send incoming requests
        proxy_pass http://localhost:3334/;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_redirect off;

        # Next two lines allow to proxy websocket connections :)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }

    error_page 502 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

Our NGINX is now redirecting every request coming from `foo.example.com` port `80` to `http://localhost:3334`.

#### Configure domain and subdomain

Point both `example.com` and `foo.example.com` to the AWS instance address. For our example, the instance address is `1.1.1.1`. How to do it mainly depends on your domain provider but essentially you should see the next entries on your DNS configuration:

```
example.com       A   1.1.1.1
foo.example.com   A   1.1.1.1
```

That's two `A` entries pointing to `1.1.1.1`.

At this point, and if the DNS are working properly, you can visit `foo.example.com` on your browser and you should see a NGINX error (502 or 404), but this is good, our NGINX is properly handling our request from our subdomain.

#### Create a limited user

Since we don't want to use an administrator user for our tunnels, let's create a limited user, for our example, the user will be `tunnel`.

```sh
$ sudo useradd -m tunnel -s /bin/false
```

Prepare the `.ssh` directory for the user `tunnel`:

```sh
$ sudo mkdir /home/tunnel/.ssh
$ sudo touch /home/tunnel/.ssh/authorized_keys
```


### Client | Raspberry PI 3B+

#### Create SSH key pair

```sh
$ ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

When asked, save your key pair in `/home/<raspberry-pi-user>/.ssh/id_rsa_tunnel_example_com`. Now you should see the key pair:

```sh
$ ls /home/<raspberry-pi-user>/.ssh
id_rsa_tunnel_example_com
id_rsa_tunnel_example_com.pub
```

Copy the public key to the authorized keys in your server:

```sh
# Copy this
$ cat /home/<raspberry-pi-user>/.ssh/id_rsa_tunnel_example_com.pub 
```

Now, in your server (the AWS instance):

```sh
# Open authorized_keys and append your public key from the Raspberry
$ sudo nano /home/tunnel/.ssh/authorized_keys
```

There are plenty of ways to do the copy & paste, but this is easy to do for any kind of user.

#### Create a systemd dynamic service

Create the service file:

```sh
$ sudo touch /etc/systemd/system/secure-tunnel@.service
```

Open the created file and paste the next lines:

```sh
$ sudo nano /etc/systemd/system/secure-tunnel@.service
```

```sh
[Unit]
Description=Setup a secure tunnel to %I
After=network.target

[Service]
Environment="LOCAL_ADDR=localhost"
EnvironmentFile=/etc/default/secure-tunnel@%i
ExecStart=/usr/bin/ssh -NT -o ServerAliveInterval=60 -o ExitOnForwardFailure=yes -i ${SSH_KEY} -R ${TUNNEL_PORT}:${LOCAL_ADDRESS}:${LOCAL_PORT} ${TARGET}

# Restart every >2 seconds to avoid StartLimitInterval failure
RestartSec=5
Restart=always

[Install]
WantedBy=multi-user.target
```

Now create a defaults file, which allows us to have a custom service for our dynamic service:

```sh
$ sudo nano /etc/default/secure-tunnel@foo_example_com
```

```sh
TARGET=tunnel@example.com
LOCAL_ADDRESS=127.0.0.1
LOCAL_PORT=8080
TUNNEL_PORT=3334
SSH_KEY=/home/user/.ssh/id_rsa_foo_example_com
```

Enable the service:

```sh
$ sudo systemctl enable secure-tunnel@foo_example_com
```

If all went fine, now you have a SSH reverse tunnel from the AWS instance to your Raspberry PI. 

#### What is going on?

Every request to `foo.example.com` is going to the AWS instance (`1.1.1.1`), once there, NGINX is redirecting it `localhost:3334`. The Raspberry Pi has a reverse SSH tunnel which links the AWS instance port `3334` to the Raspberry Pi port `8080`. This means, when you visit `foo.example.com` you'll end in the port `8080` of your Raspberry Pi.

```
foo.example.com <------> Raspberry Pi port 8080
```

### Test

Launch a static server in your Raspberry Pi:

```sh
$ python -m SimpleHTTPServer 8080
```

Now, if you visit `foo.example.com`, you'll see the content served by the Raspberry Pi on port 8080 through the Python static server we just run.

### Adding more services

This is pretty simple now:

Create a new `A` entry for your domain, pointing to the AWS instance, for example `bar.example.com`.

```
example.com      A  1.1.1.1
foo.example.com  A  1.1.1.1
bar.example.com  A  1.1.1.1
```

Add a new NGINX server listening to a different domain (`bar.example.com`) and redirecting to a different port. Instead of `3334` use `3335` for example. Reload the NGINX configuration.

```sh
$ sudo cp /etc/nginx/sites-enabled/foo_example_com /etc/nginx/sites-enabled/bar_example_com
# Replace the values for the new service (subdomain and localhost port)
$ sudo nano /etc/nginx/sites-enabled/bar_example_com
$ sudo nginx -s reload
```

Create a new service file in your Raspberry Pi, `/etc/default/secure-tunnel@bar_example_com` and replace `TUNNEL_PORT` by `3335` and `LOCAL_PORT` by the port of the new service. Enable the service and start it.

```sh
$ sudo cp /etc/default/secure-tunnel@foo_example_com /etc/default/secure-tunnel@bar_example_com
# Replace tunnel port and local port
$ sudo nano /etc/default/secure-tunnel@bar_example_com
$ sudo systemctl enable secure-tunnel@bar_example_com
$ sudo systemctl start secure-tunnel@bar_example_com
```

### TLS and security notes

Right now, you configured an architecture which works for HTTP requests, if you want to use HTTPS you'll need a certificate, configure NGINX and (probably) configure your service. The purpose of this tutorial is not to cover security concerns, just showing how to implement the solution. Security can be larger than expected to explain, but if you really know what it is, then you'll have no problem to configure it.

Besides that, the tunnel is secure (SSH) and your Raspberry is not exposed at all, we are mapping ports from a remote AWS instance to a local port in your Raspberry, also, we are using the user `tunnel` which has limited privileges and has `/bin/false` as user's shell.

### Conclusion

As we can see, there is at least an alternative to Ngrok and for people that can't use DDNS, people under a NAT or just curious people, all of them  can expose services in a secure way.