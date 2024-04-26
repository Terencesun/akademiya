import type {
    InterAgent,
    InterMemo,
    InterMsg,
    ActionHandler,
} from "./interface";
import type {
    InterWTree,
} from "../worldtree/interface";


export class Agent<ChatModel> implements InterAgent<ChatModel> {
    public name: string | undefined;
    public worldtree: InterWTree | undefined;
    public memos: Array<InterMemo> = [];
    public msgs: Array<InterMsg> = [];
    public model: ChatModel;
    public actionHandler: ActionHandler<ChatModel>;

    private clock: NodeJS.Timeout | undefined;
    private clockLocker: boolean = false;

    public constructor(name: string | undefined, model: ChatModel) {
        this.name = name;
        this.model = model;
        this.actionHandler = async () => {};
    }

    public register(worldtree: InterWTree) {
        this.worldtree = worldtree;
    }

    public action(handler: ActionHandler<ChatModel>) {
        this.actionHandler = handler;
    }

    public talkTo(to: string, msg: string) {
        (this.worldtree as InterWTree).msgs.push({
            to,
            from: this.name as string,
            msg,
        });
    }

    public costRecord(token: number) {
        (this.worldtree as InterWTree).costToken.push({
            name: this.name as string,
            token,
        });
    }

    public lifeCycle() {
        this.clock = setInterval(async () => {
            if (!this.clockLocker) {
                this.clockLocker = true;
                while (this.msgs.length > 0) {
                    const msg = this.msgs.shift();
                    await this.actionHandler(this, this.model, msg as InterMsg);
                }
                this.clockLocker = false;
            }
        }, 100);
    }

    public run() {
        this.lifeCycle();
    }

    public kill() {
        clearInterval(this.clock as NodeJS.Timeout);
        this.clockLocker = false;
    }

}
