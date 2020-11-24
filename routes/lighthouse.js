const { Router } = require('express')
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const bodyParser = require('body-parser')
const fs = require('fs')
const app_root_path = require('app-root-path')

const router = Router()


function wait(val) {
  return new Promise(resolve => setTimeout(resolve, val));
}

function createFileName(optionSet, rand_num) {
  const { emulatedFormFactor } = optionSet.settings;
  const fileExtension = 'json'
  return `${rand_num}-${emulatedFormFactor}.${fileExtension}`;
}

async function launchLighthouse(optionSet, opts, results, url, rand_num) {
  let filename = null;
  await chromeLauncher
    .launch({ chromeFlags: opts.chromeFlags })
    .then(async chrome => {
      opts.port = chrome.port;
      try {
        results = await lighthouse(url, opts, optionSet);
      } catch (e) {
        console.error("lighthouse", e);
      }
      filename = createFileName(optionSet, rand_num)
      let filepath = `${app_root_path}/static/reports/${filename}`;
      fs.writeFileSync(filepath, results.report[0], function (err) {
        if (err) return console.log(err);
      });
      await wait(500);
      await chrome.kill();
    });
  return filename;
}

async function runLighthouseAnalysis(url) {
  const lighthouseOptionsArray = [
    {
      extends: 'lighthouse:default',
      settings: {
        emulatedFormFactor:'desktop',
        output: ['json'],
      },
    },
    {
      extends: 'lighthouse:default',
      settings: {
        emulatedFormFactor:'mobile',
        output: ['json'],
      },
    },
  ]
  let results;
  let reports = [];
  const opts = {}
  for (const optionSet of lighthouseOptionsArray) {
    console.log("****** Starting Lighthouse analysis ******");
    let rand_num = Math.round(Math.random() * 100000);
    reports.push(await launchLighthouse(optionSet, opts, results, url, rand_num));
  }
  return reports
}

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))

router.get('/', (req, res) => {
   res.render('index', {
      title: 'Lighthouse Tool',
   });
});

router.post('/get-analysis', async (req, res) => {
    let url = req.body.url;
    let reports = await runLighthouseAnalysis(url);
    res.render('index', {
        title: 'Lighthouse Tool',
        desktop: `/reports/${reports[0]}`,
        mobile: `/reports/${reports[1]}`,
    });
});

module.exports = router;