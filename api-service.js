const fetch = require("node-fetch");
const fbTemplate = require("claudia-bot-builder").fbTemplate;

class ApiService {
  constructor() {
    this.baseUrl = process.env.API_URL;
    this.compId = process.env.COMPETITION_ID;
  }

  call(content, payload) {
    switch (content.query) {
      case "fixtures":      
        return this.getFixtures(payload);
      case "standings":
        return this.getStandings(payload);
      default:
        return null;
    }
  }

  getFixtures(payload) {
    return this.sendRequest("fixtures", data => this.parseFixtures(data.fixtures, payload));
  }

  parseFixtures(fixtures, payload) {
    let fixtureDate = null;

    if (!payload) {
      const now = new Date();
      const startDate = new Date(process.env.START_DATE);
      fixtureDate = now < startDate ? startDate : now;
    } else {
      fixtureDate = new Date(+payload);
    }
    
    let message = `Fixtures on ${fixtureDate.toDateString()}:\n`;
    for (const fixture of fixtures) {
      const currentFixtureDate = new Date(fixture.date.split("T")[0])
      if (currentFixtureDate > fixtureDate || 
        !fixture.homeTeamName || 
        !fixture.awayTeamName) {
        break;
      }

      if (currentFixtureDate.toDateString() !== fixtureDate.toDateString()) {
        continue;
      }

      message += `${fixture.homeTeamName} vs ${fixture.awayTeamName}\n`;
    }
    
    return [
      message, 
      new fbTemplate.Button("What next?")
      .addButton("Next day", `FIXTURES|${new Date(fixtureDate).setDate(fixtureDate.getDate() + 1)}`)
      .addButton("Get standings", "SELECT_GROUP")
      .get()
    ];
  }

  getStandings(payload) {
    if (!payload) {
      return null;
    }

    return this.sendRequest("leagueTable", data => this.parseStandings(data.standings, payload));
  }

  parseStandings(standings, payload) {
    let message = `Group ${payload}:\n`;
    standings[payload].forEach((item, index) => message += `${index+1}. ${item.team} ${item.points}pts\n`);
    return message;
  }

  sendRequest(endpoint, callback) {
    const url = `${this.baseUrl}/${this.compId}/${endpoint}`;
    return fetch(url).then(res => res.json()).then(data => callback.call(null, data));
  }
}

module.exports = ApiService;
