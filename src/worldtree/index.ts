import type {
    InterMsg,
    InterWTree,
    InterWTreeOpts,
    InterCost,
} from "./interface";
import type {
    InterAgent,
    InterMemo,
} from "../agent/interface";
import { logger } from "../utils/logger";
import { sumToken } from "../utils/sum";
import * as path from "node:path";
import * as fs from "node:fs";
import * as process from "node:process";

export class Worldtree implements InterWTree {
    public round: number = 0;
    public currentRound: number = 0;
    public currentTick: number = 0;
    public tickThreshold: number = 0;
    public agents: Record<string, InterAgent<any>> = {};
    public msgs: Array<InterMsg> = [];
    public costToken: Array<InterCost> = [];

    private clock: NodeJS.Timeout | undefined;
    private clockLocker: boolean = false;
    private memoFile: string = "";

    public constructor(agents: Array<InterAgent<any>>, options: InterWTreeOpts = {}) {
        this.round = options.round ? options.round : 1;    // 默认一轮
        this.tickThreshold = options.tickThreshold ? options.tickThreshold : 1 * 60 * 10;    // 默认值是真实世界的1分钟
        this.memoFile = options.memoFile ? options.memoFile : path.resolve(process.cwd(), `./${new Date().getTime()}_memo.json`);    // 默认值是真实世界的1分钟
        for (const agent of agents) {
            this.agents[agent.name as string] = agent;
        }
    }

    public msgDispatch() {
        while (this.msgs.length > 0) {
            const msg = this.msgs.shift() as InterMsg;
            this.agents[msg.to].msgs.push(msg);
        }
    };

    public lifeCycle() {
        return new Promise(resolve => {
            this.clock = setInterval(() => {
                if (!this.clockLocker) {
                    this.clockLocker = true;
                    // 分发消息
                    this.msgDispatch();
                    this.clockLocker = false;
                }
                this.currentTick ++;
                if (this.currentTick >= this.tickThreshold) {
                    // 轮次加一
                    this.persist();
                    this.currentRound ++;
                    this.currentTick = 0;
                    logger(`世界轮转->${this.currentRound}->花费:${sumToken(this.costToken)} tokens`);
                    if (this.currentRound > this.round) {
                        logger("世界运转结束，agent任务收尾");
                        resolve(true);
                    }
                }
            }, 100);
        });
    }

    public persist() {
        const store: Record<string, Array<InterMemo>> = {};
        for (const agentName of Object.keys(this.agents)) {
            store[agentName] = this.agents[agentName].memos;
        }
        logger(this.memoFile);
        if (fs.existsSync(this.memoFile)) fs.unlinkSync(this.memoFile);
        fs.appendFileSync(this.memoFile, JSON.stringify(store, null, 4));
    }

    public recover(memo: Record<string, Array<InterMemo>>) {
        for (const agentName of Object.keys(memo)) {
            this.agents[agentName].memos.push(...memo[agentName]);
        }
    }

    public async run(msg: InterMsg) {
        this.msgs.push(msg);
        for (const agentName of Object.keys(this.agents)) {
            this.agents[agentName].register(this);
            this.agents[agentName].run();
        }
        await this.lifeCycle();
        await this.kill();
    }

    public async kill() {
        clearInterval(this.clock as NodeJS.Timeout);
        this.clockLocker = false;
        for (const agentName of Object.keys(this.agents)) {
            await this.agents[agentName].kill();
        }
        logger("agent任务收尾完成");
    }

}
