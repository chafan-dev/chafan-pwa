// Test xpath in chrome: $x(path)

const { Builder, By, Key, until, logging } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const rl = require('readline');
const readline = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const commandLineArgs = require('command-line-args');
const options = commandLineArgs([
  {
    name: 'interactive',
    alias: 'i',
    type: Boolean,
  },
]);

console.log(options);

// Prepare readline.question for promisification
readline.question[util.promisify.custom] = (question) => {
  return new Promise((resolve) => {
    readline.question(question, resolve);
  });
};

const screen = {
  width: 1280,
  height: 960,
};

const firstText =
  'Twitter, Facebook 类型的社交网络在未来会不会变成政府依靠税收运营的公共基础设施？\n我认为未来一段时间政府不会依靠税收运营社交网络。 政府税收... More';
const cardTexts = [
  firstText,
  'Twitter, Facebook 类型的社交网络在未来会不会变成政府依靠税收运营的公共基础设施？',
  'Ask',
  'Write',
  'Answer',
];

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function deadCode(driver) {
  await driver.wait(until.elementsLocated(By.xpath("//*[text()='No more new activities.']")));
  const es = await driver.findElements(By.className('v-card'));
  let firstElem;
  const esTexts = await Promise.all(
    es.map(async (e) => {
      const t = await e.getText();
      if (t === firstText) {
        firstElem = e;
      }
      return t;
    })
  );
  assert.deepStrictEqual(
    esTexts,
    cardTexts,
    'unequal texts: ' + JSON.stringify(esTexts) + '\n !== \n' + JSON.stringify(cardTexts)
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
}

async function testUserLogin() {
  try {
    console.log('Reset and e2e-test backend ...');
    const { error, stdout, stderr } = await exec('poetry run bash reset_and_e2e_test.sh', {
      cwd: '../chafan/',
    });
    if (error) {
      console.log(stdout);
      console.log(stderr);
      return;
    }
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
  }

  let chromeOptions = new chrome.Options();
  if (!options.interactive) {
    chromeOptions = chromeOptions.headless().windowSize(screen);
  }
  let driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
  try {
    await driver.get('http://100.120.141.73:8080/login');
    await driver.wait(until.titleIs('Chafan Dev'), 1000);
    await driver.findElement(By.name('login')).sendKeys('test@cha.fan');
    await driver.findElement(By.name('password')).sendKeys('test');
    await (await driver.findElement(By.xpath("//*[text()=' 登录 ']"))).click();
    await driver.wait(until.urlIs('http://100.120.141.73:8080/'), 20000);

    // Overlay for new user
    const overlayContent = driver.findElement(
      By.xpath('//div[@class="v-overlay__content"]//*[text()="使用前必读"]')
    );
    console.log('Checking visible overlay with 使用前必读...');
    await driver.wait(until.elementIsVisible(overlayContent), 100000);
    console.log('Clicking visible overlay with 同意...');
    await (
      await driver.findElement(By.xpath('//div[@class="v-overlay__content"]//*[text()="同意"]'))
    ).click();
    console.log('Waiting overlay turning invisible...');
    await driver.wait(until.elementIsNotVisible(overlayContent), 1000);
  } catch (e) {
    console.log(e);
    if (options.interactive) {
      const answer = await util.promisify(readline.question)('Exit?');
      readline.close();
    }
  } finally {
    console.log('Quitting...');
    await driver.quit();
  }
}

testUserLogin();
