const conversation = require("./conversation.json");
const fbTemplate = require("claudia-bot-builder").fbTemplate;
const apiService = require("./api-service");

class Controller {
  constructor() {
    this.apiService = new apiService();
  }

  handleMessage(message) {
    const splitMessage = message.split("|");
    const text = splitMessage[0];
    const payload = splitMessage.length > 1 ? splitMessage[1] : null;
    const step = conversation[text];

    if (!step) {
      return "Sorry, could you repeat that";
    }

    if (step.type) {
      return this.buildResponse(step, payload);
    }

    return step.message.map(substep => this.buildResponse(substep));
  }

  buildResponse(substep, payload) {
    switch (substep.type) {
      case "text":
        return substep.content;
      case "button":
        return this.buttonMessage(substep);
      case "generic":
        return this.genericMessage(substep);
      case "quick":
        return this.quickMessage(substep);
      case "api":
        return this.apiService.call(substep, payload);
      default:
        return substep.content;
    }
  }

  buttonMessage(content) {
    const btn = new fbTemplate.Button(content.message);
        content.options.forEach(option =>
          btn.addButton(option.title, option.url)
        );
        return btn.get();
  }

  genericMessage(content) {
    const generic = new fbTemplate.Generic();
    generic.addBubble(content.title, content.subtitle).addImage(content.image);

    if (content.url) {
      generic.addUrl(content.url)
    }

    content.buttons.forEach(btn => generic.addButton(btn.title, btn.url));
    return generic.get();
  }

  quickMessage(content) {
    const text = new fbTemplate.Text(content.message);
    content.options.forEach(opt => text.addQuickReply(opt.title, opt.payload));
    return text.get();
  }
}

module.exports = Controller;
