const fs = require('fs');

const sport = 'nfl';
const filename = `${sport}_odds.json`;

class oddsObj {
    constructor(awayTeam, homeTeam, awayML, homeML, awaySpread, homeSpread, over, under, dateTime) {
        this.awayTeam = awayTeam;
        this.homeTeam = homeTeam;
        this.awayML = awayML;
        this.homeML = homeML;
        this.awaySpread = awaySpread;
        this.homeSpread = homeSpread;
        this.over = over;
        this.under = under;
        this.dateTime = dateTime;
    }
}

let lines = fs.readFileSync(filename, 'utf-8').split('\n');
let elements = lines.map(line => {
    return new oddsObj(...line.split('/'))
})

let finalObj = {
    sport : sport,
    oddsData : elements.slice(0,-1)
};

finalObj = JSON.stringify(finalObj);

fs.writeFile(filename, finalObj, (err) => {if (err) console.log(err)});