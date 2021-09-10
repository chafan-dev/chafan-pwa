// Test xpath in chrome: $x(path)

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const util = require('util');
const execSync = require('child_process').execSync;
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
  {
    name: 'host',
    alias: 'h',
    type: String,
  },
  {
    name: 'backend_dir',
    alias: 'b',
    type: String,
  },
  {
    name: 'use_poetry',
    alias: 'u',
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

async function testUserLogin() {
  console.log('Reset and e2e-test backend ...');
  let cmd = 'bash reset_and_e2e_test.sh';
  if (options.use_poetry) {
    cmd = 'poetry run ' + cmd;
  }
  try {
    execSync(cmd, {
      cwd: options.backend_dir,
      stdio: 'inherit',
    });
  } catch {
    process.exit(-1);
  }

  let chromeOptions = new chrome.Options();
  if (!options.interactive) {
    chromeOptions = chromeOptions.headless().windowSize(screen);
  }
  let driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
  try {
    await driver.get(`http://${options.host}:8080/login`);
    await driver.wait(until.titleIs('Chafan Dev'), 1000);
    await driver.findElement(By.name('login')).sendKeys('test@cha.fan');
    await driver.findElement(By.name('password')).sendKeys('test');
    await driver.findElement(By.xpath("//*[text()=' 登录 ']")).click();
    await driver.wait(until.urlIs(`http://${options.host}:8080/`), 20000);

    const overlayContent = driver.findElement(
      By.xpath('//div[@class="v-overlay__content"]//*[text()="使用前必读"]')
    );
    console.log('Checking visible overlay with 使用前必读...');
    await driver.wait(until.elementIsVisible(overlayContent), 100000);
    console.log('Clicking visible overlay with 同意...');
    await driver
      .findElement(By.xpath('//div[@class="v-overlay__content"]//*[text()="同意"]'))
      .click();
    console.log('Waiting overlay turning invisible...');
    await driver.wait(until.elementIsNotVisible(overlayContent), 1000);

    console.log('Clicking main-menu-avatar-btn...');
    await driver.findElement(By.id('main-menu-avatar-btn')).click();
    const loggedOutBtn = driver.findElement(By.xpath('//div[@id="main-menu"]//*[text()="登出"]'));
    await driver.wait(until.elementIsVisible(loggedOutBtn), 1000);
    await loggedOutBtn.click();

    console.log('Checking visible text 登录后浏览更多个性化内容...');
    await driver.wait(
      until.elementIsVisible(
        driver.findElement(By.xpath('//*[text()=" 登录后浏览更多个性化内容！"]'))
      ),
      1000
    );
  } catch (e) {
    console.log(e);
    console.log('Current URL: ' + (await driver.getCurrentUrl()));
    if (options.interactive) {
      await util.promisify(readline.question)('Exit?');
      readline.close();
    }
    await driver.quit();
    process.exit(-1);
  } finally {
    console.log('Quitting...');
    await driver.quit();
  }
}

testUserLogin().then(() => {});
