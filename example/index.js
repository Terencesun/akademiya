const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const { Worldtree, Agent } = require("akademiya");
const OpenAI = require("openai");

const openai = new OpenAI({
    baseURL: "https://api.moonshot.cn/v1",
    apiKey: "sk-xxx",
});
let request = "";

///////////////////////////////////////////////////////////////////
const formatAnswer = answer => {
    let rawData = answer;
    if (rawData.includes("```json")) {
        rawData = rawData.split("json")[1];
        rawData = rawData.split("```")[0];
        rawData = _.trim(_.trim(rawData, "\n"), "\t");
    }
    return JSON.parse(rawData);
}

function getPromptTmpl(tmpl) {
    const ctx = fs.readFileSync(path.resolve(__dirname, `./${tmpl}`), "utf-8");
    return ctx;
}

function storeMemo(agent, msg, answer) {
    agent.memos.push({
        to: msg.to,
        from: msg.from,
        msg: getPromptTmpl("memo").replace("__FROM__", msg.from).replace("__QUESTION__", msg.msg).replace("__ANSWER__", answer),
    });
}
///////////////////////////////////////////////////////////////////
function agent1() {
    const agent = new Agent("poet", openai);
    agent.action(async (agt, model, msg) => {
        console.log(msg);
        if (msg.from === "system") {
            request = msg.msg;
            const { choices, usage: { total_tokens } } = await openai.chat.completions.create({
                messages: [{ role: msg.from, content: getPromptTmpl("agent1_1").replace("__INPUT__", msg.msg) }],
                model: "moonshot-v1-8k",
              }, {
                stream: false,
            });
            agt.costRecord(total_tokens);
            const answer = formatAnswer(choices[0]["message"]["content"]);
            agt.talkTo("judges", answer["content"]);
            storeMemo(agt, msg, answer["content"]);
        } else {
            const history = [];
            for (const memo of agt.memos) {
                history.push({
                    role: "system",
                    content: memo.msg,
                });
            }
            const { choices, usage: { total_tokens } } = await openai.chat.completions.create({
                messages: [
                    ...history,
                    { role: "system", content: getPromptTmpl("agent1_2").replace("__INPUT__", msg.msg) },
                ],
                model: "moonshot-v1-8k",
              }, {
                stream: false,
            });
            agt.costRecord(total_tokens);
            const answer = formatAnswer(choices[0]["message"]["content"]);
            agt.talkTo("judges", answer["content"]);
            storeMemo(agt, msg, answer["content"]);
        }
    });
    return agent;
};

function agent2() {
    const agent = new Agent("judges", openai);
    agent.action(async (agt, model, msg) => {
        if (msg.from === "poet") {
            console.log(msg);
            const history = [];
            for (const memo of agt.memos) {
                history.push({
                    role: "system",
                    content: memo.msg,
                });
            }
            const { choices, usage: { total_tokens } } = await openai.chat.completions.create({
                messages: [
                    ...history,
                    { role: "system", content: getPromptTmpl("agent2_1").replace("__REQUEST__", request).replace("__INPUT__", msg.msg) },
                ],
                model: "moonshot-v1-8k",
              }, {
                stream: false,
            });
            agt.costRecord(total_tokens);
            const answer = formatAnswer(choices[0]["message"]["content"]);
            agt.talkTo("poet", answer["content"]);
            storeMemo(agt, msg, answer["content"]);
        }
    });
    return agent;
};

function wdt(...args) {
    const wdt = new Worldtree(args, {
        round: 5,
        memoFile: path.resolve(__dirname, `./${new Date().getTime()}_memo.json`),
    });
    return wdt;
}
///////////////////////////////////////////////////////////////////

async function main() {
    const poet = agent1();
    const judges = agent2();
    const boen = wdt(poet, judges);
    await boen.run({
        to: "poet",
        from: "system",
        msg: "请以某一传统节日为主题创作一首五言或七言律诗",
    });
}

main();
