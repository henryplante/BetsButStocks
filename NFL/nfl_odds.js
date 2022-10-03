'use strict';
const puppeteer = require('puppeteer');
const fs = require('fs/promises');
require('events').EventEmitter.defaultMaxListeners = 18;

const sport = 'nfl';
const filename = `${sport}_odds.json`;
const url = `https://www.oddsshark.com/${sport}/scores`;
 
async function writeData(data) {
    try {
        await fs.appendFile(filename, data + '\n');
    } catch (err) {
        console.log(err);
    }
};

async function getLinks(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
 
    await page.goto(url);
 
    await page.type('.scoreboard', 'Headless Chrome');
 
    const allResultsSelector = '.scoreboard';
    await page.waitForSelector(allResultsSelector);
    await page.click(allResultsSelector);
 
    const resultsSelector = '.scores-matchup__link';
    await page.waitForSelector(resultsSelector);
 
    const links = await page.evaluate(resultsSelector => {
        const anchors = Array.from(document.querySelectorAll(resultsSelector));
        return anchors.map(anchor => {
            return anchor.href;
        });
    }, resultsSelector);

    await browser.close();

    links.forEach(async (link) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
     
        await page.goto(link);
     
        await page.type('.node__content', 'Headless Chrome');

        const allResultsSelector = '.gc-team-record--left';
        await page.waitForSelector(allResultsSelector);
        await page.click(allResultsSelector);
     
        let resultsSelector = '.gc-team-info__text--primary';
        await page.waitForSelector(resultsSelector);
     
        const element = await page.evaluate(resultsSelector => {
            const anchors = Array.from(document.querySelectorAll(resultsSelector));
            return anchors.map(anchor => {
            const title = anchor.textContent.split('|')[0].trim();
            return title;
            });
        }, resultsSelector);
        let teams = [element[0] + ' ' +  element[1], element[2] + ' ' + element[3]];

        resultsSelector = '.table__odd';
        await page.waitForSelector(resultsSelector);
    
        const odds = await page.evaluate(resultsSelector => {
            const anchors = Array.from(document.querySelectorAll(resultsSelector));
            return anchors.map(anchor => {
            const title = anchor.textContent.split('|')[0].trim();
            return title;
            });
        }, resultsSelector);

        resultsSelector = '.gc-event-date';
        await page.waitForSelector(resultsSelector);
    
        const date = await page.evaluate(resultsSelector => {
            const anchors = Array.from(document.querySelectorAll(resultsSelector));
            return anchors.map(anchor => {
            const title = anchor.textContent.split('|')[0].trim();
            return title;
            });
        }, resultsSelector);

        // Need to verify these indices and make sure consistent
        let spreadHome = odds[17];
        let spreadAway = odds[19]
        let over = odds[1];
        let under = odds[3];
        let mlHome = odds[16];
        let mlAway = odds[18];
    
        let data = `${teams[0]}/${teams[1]}/${mlHome}/${mlAway}/${spreadHome}/${spreadAway}/${over}/${under}/${String(date).split('ET')[0] + 'ET'}`
        writeData(data);
     
        await browser.close();
     });

};

fs.writeFile(filename, '');
getLinks(url);