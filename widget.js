/******************************
 * Info
 *****************************/

/*****************************
 * How to setup: Look on the repo https://github.com/Hider-alt/cr-widget/blob/main/README.md

 * Version History:
 * v1.0 -> Initial release
 * v1.1 -> Changes in chest display & Minor fixes (some chests caused the widget to crash)

 * Credits: RoyaleAPI

 *****************************/

/******************************
 * Configuration
 *****************************/

// Get token for free at https://developer.clashroyale.com/#/account
// Set in "allowed IP" this: 45.79.218.79
// Set whatever you want in name and description
// Paste the Token below
const API_TOKEN = ''

// Set your tag here or in widget args
let ACCOUNT_TAG = '#'

const battlesText = 'Battles';
const winText = 'Win';
const recordText = 'Record';
const deckText = 'Deck';
const upcomingChestsText = 'Next chests';
const updateAvailableText = 'New update available! Click the widget';


/******************************
 * Setup
 *****************************/

const VERSION = 'v1.1';
const BASE_API_URL = "https://proxy.royaleapi.dev/v1";
ACCOUNT_TAG = args.widgetParameter || ACCOUNT_TAG || '';
const WIDGET_FAMILY = config.widgetFamily || 'large';

const widget = new ListWidget();
const fm = FileManager.iCloud();

const titleFont = Font.blackSystemFont(WIDGET_FAMILY === 'large' ? 18 : 16);
const h2Font = Font.boldSystemFont(WIDGET_FAMILY === 'large' ? 14 : 12);
const subtitleFont = Font.mediumRoundedSystemFont(WIDGET_FAMILY === 'large' ? 10 : 8);

const areUpdatesAvailable = await checkRepoUpdates();

if (areUpdatesAvailable)
    widget.url = 'https://github.com/Hider-alt/cr-widget/blob/main/docs/update.md';
else
    widget.url = `https://royaleapi.com/player/${ACCOUNT_TAG.replace('#', '')}`;

const accountData = await getAccountData(ACCOUNT_TAG);
await buildLayout(widget);

Script.setWidget(widget);
Script.complete();
await widget.presentLarge();


/******************************
 * Widget functions
 *****************************/

async function buildLayout(widget) {
    let N, chests;

    switch (WIDGET_FAMILY) {
        case 'medium':
            widget.setPadding(10, 0, 10, 0);

            await addHeader(widget);
            widget.addSpacer();

            N = 6;
            chests = getNChests(accountData.upcomingChests, N);
            await addUpcomingChests(widget, chests);

            break;
        case 'large':
            widget.setPadding(15, 0, 10, 0);

            await addHeader(widget);
            widget.addSpacer();

            addStats(widget)
            widget.addSpacer();

            await addDeck(widget);
            widget.addSpacer();

            // Get first N chests (reduce N if widget crashes) (min 4 chests)
            N = 4
            chests = getNChests(accountData.upcomingChests, N);
            await addUpcomingChests(widget, chests, Math.max(4, N / 2));

            break;
        default:
            throw new Error('Invalid widget size');
    }
}


async function addHeader(containerStack) {
    const header = containerStack.addStack();
    header.layoutHorizontally();
    header.centerAlignContent();
    header.setPadding(5, 10, 0, 10);

    const expImage = await getExpImage();
    const expHeader = header.addImage(expImage);
    expHeader.imageSize = new Size(26.9, 27.4);
    header.addSpacer(4);

    const accInfo = header.addStack();
    accInfo.layoutVertically();

    const nameText = accInfo.addText(accountData.name)
    nameText.font = titleFont;

    // Clan Text -> If updates available, add update text, else if clan name exists, add clan name
    let clanText = areUpdatesAvailable ? accInfo.addText(updateAvailableText) : (accountData.clanName ? accInfo.addText(accountData.clanName) : "");
    clanText.font = subtitleFont;
    clanText.textColor = Color.lightGray();


    header.addSpacer();

    const trophiesInfo = header.addStack();
    trophiesInfo.centerAlignContent();

    const arenaImg = await getAsset(
        accountData.leagueLevel ? `arenas/league${accountData.leagueLevel}.png` : `arenas/arena${accountData.arenaNumber}.png`,
        accountData.leagueLevel ? `league${accountData.leagueLevel}` : `arena${accountData.arenaNumber}`
    );
    const trophyImg = trophiesInfo.addImage(arenaImg);
    trophyImg.imageSize = new Size(30, 30);

    const trophiesText = trophiesInfo.addText(accountData.trophies.toString());
    trophiesText.font = titleFont;
    trophiesText.textColor = new Color("#f0d04b");
}


function addStats(containerStack) {
    const statsRow = containerStack.addStack();
    statsRow.layoutHorizontally();

    const stats = [
        {
            title: winText,
            value: (accountData.winRate * 100).toFixed(1).toString() + "%"
        },
        {
            title: battlesText,
            value: accountData.battles.toLocaleString(Device.locale().replaceAll("_", "-"))
        },
        {
            title: recordText,
            value: accountData.bestTrophies.toString()
        }
    ];

    for (const [index, stat] of stats.entries()) {
        const statStack = statsRow.addStack();
        statStack.layoutVertically();

        const titleRow = statStack.addStack();
        titleRow.addSpacer()
        const statTitle = titleRow.addText(stat.title);
        statTitle.font = subtitleFont;
        statTitle.textColor = Color.lightGray();
        statTitle.centerAlignText();
        titleRow.addSpacer()

        const statRow = statStack.addStack();
        statRow.addSpacer()
        const statValue = statRow.addText(stat.value);
        statValue.font = titleFont;
        statRow.addSpacer()

        if (index !== stats.length - 1)
            statsRow.addSpacer();
    }
}


async function addDeck(containerStack) {
    const deck = containerStack.addStack();
    deck.layoutVertically();
    deck.centerAlignContent();
    deck.setPadding(0, 10, 0, 10);

    const deckTitle = deck.addText(deckText);
    deckTitle.font = h2Font;

    deck.addSpacer(2);

    const cardsRow = new DrawContext();
    cardsRow.opaque = false;
    cardsRow.respectScreenScale = true;

    const rowWidth = 800;
    const cardWidth = (rowWidth / 8) - 2;
    const cardHeight = cardWidth / 0.84;   // 0.84 is the ratio of the card image
    cardsRow.size = new Size(rowWidth, cardHeight);

    for (const [index, card] of accountData.deck.entries()) {
        let cardImg = await getAsset(
            `cards-150/${card.name.toLowerCase().replaceAll(" ", "-").replaceAll(".", "")}.png`,
            card.name
        );

        cardsRow.drawImageInRect(cardImg, new Rect(index * (cardWidth + 2), 0, cardWidth, cardHeight));
    }

    deck.addImage(cardsRow.getImage());
}


async function addUpcomingChests(containerStack, chests, chestsPerRow = 6) {
    const chestsStack = containerStack.addStack();
    chestsStack.layoutVertically();
    chestsStack.centerAlignContent();
    chestsStack.setPadding(0, 10, 0, 10);

    const chestsTitle = chestsStack.addText(upcomingChestsText);
    chestsTitle.font = h2Font;

    chestsStack.addSpacer(2);

    const chestsRow = new DrawContext();
    chestsRow.opaque = false;
    chestsRow.respectScreenScale = true;

    const rowsCount = Math.ceil(chests.length / chestsPerRow);
    const rowWidth = 1024;
    const firstChestBonus = 35;                                              // First chest is bigger
    const xPadding = 25;                                                     // Padding between chests
    const extraPadding = firstChestBonus / chestsPerRow;                     // Extra padding for other rows after first
    const yPadding = 40;                                                     // Padding between chests
    const marginTop = 10;

    const chestWidth = (rowWidth / chestsPerRow) - xPadding;
    const firstChestWidth = chestWidth + firstChestBonus;
    const nextChestWidth = chestWidth - firstChestBonus / (chestsPerRow - 1);
    const chestHeight = chestWidth;                                          // 1.0 is the ratio of the chest image
    chestsRow.size = new Size(rowWidth, (chestHeight + yPadding) * rowsCount + firstChestBonus + marginTop);

    for (const [index, chest] of chests.entries()) {
        const rowNumber = Math.floor(index / chestsPerRow);

        let x, y, size;
        if (index === 0) {
            x = 0;
            y = 0;
            size = firstChestWidth;
        } else {
            if (rowNumber === 0) {
                x = index * (nextChestWidth + xPadding) + firstChestBonus;
                y = firstChestBonus / 2;
            } else {
                // Next rows
                x = (index % chestsPerRow) * (nextChestWidth + xPadding + extraPadding);
                y = rowNumber * (chestHeight + yPadding) + firstChestBonus;
            }

            size = nextChestWidth;
        }

        y += marginTop;

        await drawUpcomingChest(chest, chestsRow, x, y, size, index === 0);
    }

    chestsStack.addImage(chestsRow.getImage());

}


/******************************
 * Draw functions
 *****************************/

async function drawUpcomingChest(chest, drawContext, x, y, size, big = false) {
    // Chest name -> lowercase, no spaces, truncate at "chest", trim
    const chestName = chest.name.toLowerCase().replaceAll(" ", "").split("chest")[0].trim();
    const chestImg = await getAsset(
        `chests/chest-${chestName}.png`,
        chest.name,
        "https://cdns3.royaleapi.com/cdn-cgi/image/w=128,h=128,format=webp,quality=80/static/img/"
    );

    drawContext.drawImageInRect(chestImg, new Rect(x, y, size, size));

    // Top right counter (in pill)
    const pill = new Path();
    const countText = `+${(chest.index + 1).toString()}`;
    const pillWidth = 30 + countText.length * 18;
    const pillHeight = 50;
    const borderRadius = Math.min(25, pillHeight / 2);

    const pillX = x + size - pillWidth + (big ? 5 : 10);
    const pillY = y - (big ? 0 : 5);

    pill.addRoundedRect(new Rect(pillX, pillY, pillWidth, pillHeight), borderRadius, borderRadius);
    drawContext.addPath(pill);
    drawContext.setFillColor(new Color("#454245CC"));
    drawContext.fillPath();

    const fontSize = 36;
    drawContext.setTextColor(Color.white());
    drawContext.setFont(Font.mediumRoundedSystemFont(fontSize));

    const fontWidth = fontSize / 1.55;
    const leftPadding = (pillWidth - countText.length * fontWidth) / 2;
    drawContext.drawTextInRect(countText, new Rect(pillX + leftPadding, pillY, pillWidth, pillHeight));
}


/******************************
 * Images fetch functions
 *****************************/

async function getExpImage() {
    const w = 269;
    const h = 274;
    const expImage = await getAsset("ui/experience.png", "exp");

    const dc = new DrawContext();
    dc.opaque = false;
    dc.respectScreenScale = true;
    dc.size = new Size(w, h);

    dc.drawImageInRect(expImage, new Rect(0, 0, w, h));

    const fontSize = 130;
    dc.setTextColor(Color.white());
    dc.setFont(Font.boldSystemFont(fontSize));
    const xCord = accountData.expLevel.toString().length > 1 ? 50 : 85;
    dc.drawText(accountData.expLevel.toString(), new Point(xCord, 40));

    return dc.getImage();
}


async function getAsset(assetUrl, name, baseUrl = "https://hider-alt.github.io/cr-api-assets/") {
    let image;

    if (imageExists(name)) {
        image = await getImage(name);

        // Sometimes the image is corrupted, in that case, delete it and fetch it again
        if (!image) {
            deleteAsset(name);
            return await getAsset(assetUrl, name, baseUrl);
        }
    }
    else {
        const imageRequest = new Request(baseUrl + assetUrl);

        try {
            image = await imageRequest.loadImage();
        } catch (err) {
            // If image not found, return unknown image
            return getAsset("cards/card-legendary-unknown.png", "unknown");
        }

        saveImage(name, image);
    }

    return image;
}


/******************************
 * API Functions
 *****************************/

async function getAccountData() {
    let tag = ACCOUNT_TAG.startsWith("#") ? ACCOUNT_TAG : "#" + ACCOUNT_TAG;

    tag = tag.replace("#", "%23");

    const accResponse = await supercellAPIRequest("/players/" + tag);
    const upcomingChests = await supercellAPIRequest("/players/" + tag + "/upcomingchests");

    return {
        name: accResponse.name,
        clanName: accResponse.clan ? accResponse.clan.name : null,
        expLevel: accResponse.expLevel,
        trophies: accResponse.trophies,
        winRate: accResponse.wins / accResponse.battleCount,
        battles: accResponse.battleCount,
        bestTrophies: accResponse.bestTrophies,
        leagueLevel: accResponse.currentPathOfLegendSeasonResult != null ? accResponse.currentPathOfLegendSeasonResult.leagueNumber : null,
        arenaNumber: parseInt(accResponse.arena.name.split(" ")[1]),
        deck: accResponse.currentDeck,
        upcomingChests: upcomingChests.items
    }
}

async function supercellAPIRequest(route, method = 'GET') {
    const url = BASE_API_URL + route;
    const req = new Request(url);
    req.method = method;
    req.headers = {
        Authorization: "Bearer " + API_TOKEN
    }

    let res;
    try {
        res = await req.loadJSON();
        if (res.hasOwnProperty('reason')) {
            let text;
            switch (res['reason']) {
                case 'accessDenied.invalidIp':
                    text = "Set '45.79.218.79' in the ALLOWED IP ADDRESSES section in https://developer.clashroyale.com/#/account";
                    break;
                case 'accessDenied':
                    text = "Invalid token";
                    break;
                case 'notFound':
                    text = "Player not found";
                    break;
                default:
                    text = res['reason'];
            }

            console.log(text);
            throw new Error(text);
        }
    } catch (err) {
        console.log("Error in: " + url);
        console.log(err);

        throw new Error(err);
    }

    return res;
}

/******************************
 * Utils Functions
 *****************************/

function getNChests(chests, n) {
    // Half of N chests will be shown from 0 to N/2, the other half from -6 to (-6 + N/2)
    // (If n > N/2 + 6, show from 0 to N)

    if (n > chests.length / 2 + 6)
        return chests.slice(0, n);
    else
        return chests.slice(0, n / 2).concat(chests.slice(-6, -6 + n / 2));
}


function imageExists(name) {
    return fm.fileExists(fm.joinPath(fm.joinPath(fm.documentsDirectory(), "cr-widget"), name + ".png"));
}

async function getImage(name, ext=".png") {
    if (!name) return null;

    const base_path = fm.joinPath(fm.documentsDirectory(), "cr-widget")

    const path = fm.joinPath(base_path, name + ext)
    await fm.downloadFileFromiCloud(path)

    return Image.fromFile(path)
}

function saveImage(name, image) {
    const base_path = fm.joinPath(fm.documentsDirectory(), "cr-widget")

    if (!fm.fileExists(base_path))
        fm.createDirectory(base_path)

    const path = fm.joinPath(base_path, name + ".png")
    fm.writeImage(path, image)
}

function deleteAsset(name) {
    const path = fm.joinPath(fm.joinPath(fm.documentsDirectory(), "cr-widget"), name + ".png");
    fm.remove(path);
}

async function checkRepoUpdates() {
    return new Promise((resolve, reject) => {
        const request = new Request('https://raw.githubusercontent.com/Hider-alt/cr-widget/main/version.json');
        request.loadJSON().then(json => {
            resolve(json['version'] !== VERSION);
        }).catch(err => {
            reject(err);
        })
    });
}