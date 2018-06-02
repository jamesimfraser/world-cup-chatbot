const botBuilder = require("claudia-bot-builder");
const baseController = require("./controller");
const controller = new baseController();

module.exports = botBuilder(request => controller.handleMessage(request.text));
