# dotwallet-test

Change the example.env to .env and replace the values with your credentials from the DotWallet for Developers platform.

Run dev server with

```bash
npm run dev
```

Run with

```bash
npm run start
```

find your local host address with

```bash
ifconfig | grep netmask
```

You’ll get a result like this

```bash
        inet 127.0.0.1 netmask 0xff000000
        inet 192.168.1.142 netmask 0xffffff00 broadcast 192.168.1.255
```

Use `192.168.1.142/3000` to open the app
