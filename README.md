# [iOS] Clash Royale Widget
Track your Clash Royale profile (clan, deck, trophies, upcoming chests, and more) with a simple widget.
![Mockup](img/mockup.png)

## How to install
<sup>[Click here to see images of the instructions](./docs/install.md)</sup>

1. Download Scriptable from the App Store.
2. **Download** the Scriptable file from the [release page](https://github.com/Hider-alt/cr-widget/releases/latest).
3. Once downloaded, click the Share button.
4. Click on the Scriptable icon.
5. Click on "Add to My Scripts".
6. Set **constants** at the top of the script
   1. **API_TOKEN**:
      1. Log in or register on [Clash Royale API](https://developer.clashroyale.com/#/login).
      2. Go to [My Account](https://developer.clashroyale.com/#/account).
      3. Click on "Create New Key".
      4. Set whatever name and description you want
      5. Set in "**Allowed IP Addresses**" the following IP: `45.79.218.79`
         * _This is needed because the script uses RoyaleAPI's proxy._
   2. **ACCOUNT_TAG** _(optional)_: Your Clash Royale player tag that will be used as default.
   3. **Translate** widget texts in your language _(optional)_
7. Click on "Done".

## Add widget to the home-screen
<sup>[Click here to see images of the instructions](./docs/add-to-home.md)</sup>

1. Add a new Scriptable widget to the home-screen.
2. In "Script" select **Clash Royale**.
3. In "Parameter" insert your **player tag** (or it will show the default one set in the script).

## How to update
<sup>[Click here to see images of the instructions](./docs/update.md)</sup>

1. To update the **widget**, just click on **it**, and it will redirect to the [release page](https://github.com/Hider-alt/cr-widget/releases/latest).
2. Close momentarily Safari.
3. Copy your constants at the top of the script (specifically **API_TOKEN**).
4. **Delete `Clash Royale` script** in Scriptable.
5. Go to the release page on Safari and download the Scriptable file.
6. Make steps from 3 of the [installation instructions](#how-to-install).

## Features
With this widget you can track:
- Trophies
- Trophies record
- Win rate
- Battles count
- Deck
- Upcoming chests

### Updates
- When a new version is released, it will be written in the widget subtitle (instead of the clan name).
- To update the **widget**, just click on **it**, and it will redirect to the [latest release page](https://github.com/Hider-alt/cr-widget/releases/latest).
- Then you will have just to follow the instructions of [How to update](#how-to-update) section.

## Requirements
- Scriptable
- iPhone/iPad
- iOS 14.0 or later


© 2023 Hider

___

## Want a custom widget?
- Click [here](https://it.fiverr.com/share/P04gAp).