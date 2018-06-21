const fetch = require("node-fetch");
const fbTemplate = require("claudia-bot-builder").fbTemplate;

class FootballDataService {
  constructor() {
    this.baseUrl = process.env.API_URL;
    this.compId = process.env.COMPETITION_ID;
  }

  call(content, payload, goto) {
    switch (content.query) {
      case "fixtures":
        return this.getFixtures(payload, goto);
      case "standings":
        return this.getStandings(payload, goto);
      default:
        return null;
    }
  }

  getFixtures(payload, goto) {
    return this.sendRequest("fixtures", data =>
      this.parseFixtures(data.fixtures, payload, goto)
    );
  }

  parseFixtures(fixtures, payload, goto) {
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
      const splitTime = fixture.date.split("T");
      const currentFixtureDate = new Date(splitTime[0]);
      if (currentFixtureDate > fixtureDate) {
        break;
      }

      if (currentFixtureDate.toDateString() !== fixtureDate.toDateString()) {
        continue;
      }

      message += `${fixture.homeTeamName || "TBD"}${
        fixture.result.goalsHomeTeam !== null
          ? ` ${fixture.result.goalsHomeTeam}`
          : ""
      } ${fixture.result.goalsHomeTeam !== null ? "-" : "vs"} ${
        fixture.result.goalsAwayTeam !== null
          ? `${fixture.result.goalsAwayTeam} `
          : ""
      }${fixture.awayTeamName || "TBD"} - ${
        splitTime[1].split(/:\d{2}Z/)[0]
      }\n`;
    }

    return [
      message,
      goto(new Date(fixtureDate).setDate(fixtureDate.getDate() + 1))
    ];
  }

  getStandings(payload, goto) {
    if (!payload) {
      return null;
    }

    return this.sendRequest("leagueTable", data =>
      this.parseStandings(data.standings, payload, goto)
    );
  }

  parseStandings(standings, payload, goto) {
    let message = `Group ${payload}:\n`;
    standings[payload].forEach(
      (item, index) =>
        (message += `${index + 1}. ${item.team} ${item.points}pts\n`)
    );
    return [message, goto(null)];
  }

  sendRequest(endpoint, callback) {
    const url = `${this.baseUrl}/${this.compId}/${endpoint}`;
    return fetch(url)
      .then(res => res.json())
      .then(data => callback.call(null, data));
  }
}

module.exports = FootballDataService;
