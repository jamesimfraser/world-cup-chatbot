A simple chatbot example using claudiajs - running on a lambda instance - for viewing upcoming fixtures and current group standings in the 2018 world cup. 

### Setup
* Install claudia.js with `npm i -g claudia`
* Run `npm i`
* Follow [this guide](https://claudiajs.com/tutorials/installing.html) to setup the aws user credentials
* Setup a facebook app and page per instructions [here](https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start)
* Run `claudia create --region {{ region (e.g. eu-west-2) }} --api-module bot --configure-fb-bot `, following the instructions that appear
* Talk to the bot on messenger :)