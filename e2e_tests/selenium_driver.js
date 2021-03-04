const {Builder, By, Key, until, logging} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

const screen = {
    width: 1280,
    height: 960
};

const firstText = "Twitter, Facebook 类型的社交网络在未来会不会变成政府依靠税收运营的公共基础设施？\n我认为未来一段时间政府不会依靠税收运营社交网络。 政府税收... More";
const cardTexts = [firstText,"Twitter, Facebook 类型的社交网络在未来会不会变成政府依靠税收运营的公共基础设施？","Ask","Write","Answer"];

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

(async function example() {
    // for REPL
    // let driver = new Builder().forBrowser('chrome').build();
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless().windowSize(screen)).build();
    try {
        await driver.get('http://localhost:8080');
        // await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
        await driver.wait(until.titleIs('Chafan Demo'), 1000);
        await driver.findElement(By.name("login")).sendKeys('test@cha.fan');
        await driver.findElement(By.name("password")).sendKeys('password');
        await (await driver.findElement(By.xpath("//*[text()=' Login ']"))).click();
        await driver.wait(until.elementsLocated(By.xpath("//*[text()='No more new activities.']")));
        const es = await driver.findElements(By.className("v-card"));
        let firstElem;
        const esTexts = await Promise.all(es.map(async (e) => {
            const t = await e.getText();
            if (t === firstText) {
                firstElem = e;
            }
            return t;
        }));
        assert.deepStrictEqual(esTexts, cardTexts,
            "unequal texts: " + JSON.stringify(esTexts) + "\n !== \n" + JSON.stringify(cardTexts)
        );

        // Loading dynamically rendered preview, which should be longer
        await sleep(100);
        let loadedText = await firstElem.getText();
        assert.strictEqual(loadedText.length, 176);

        // Show the full answer
        await firstElem.click();
        await sleep(100);
        let loadedText2 = await firstElem.getText();
        assert.strictEqual(loadedText2.length, 205);

        console.log(await driver.getCurrentUrl());
    } finally {
        await driver.quit();
    }
})();