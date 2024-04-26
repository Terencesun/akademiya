import type {
    InterWTree,
} from "../worldtree/interface";

export interface InterAgent<ActionModel> {
    name: string | undefined;
    worldtree: InterWTree | undefined;
    memos: Array<InterMemo>;
    msgs: Array<InterMsg>;
    model: ActionModel;
    actionHandler: ActionHandler<ActionModel>;
    action: ActionFunc<ActionModel>;
    talkTo: TalktoFunc;
    costRecord: CostRecordFunc;
    lifeCycle: NormalFunc;
    register: registerFunc;
    run: NormalFunc;
}

export type NormalFunc = () => void;

export type registerFunc = (worldtree: InterWTree) => void;

export type ActionFunc<Model> = (handler: ActionHandler<Model>) => void;

export type ActionHandler<Model> = (agent: InterAgent<Model>, model: Model, msg: InterMsg) => Promise<void>;

export type TalktoFunc = (to: string, msg: string) => void;

export type CostRecordFunc = (cost: number) => void;

export interface InterMsg {
    to: string;
    from: string;
    msg: string;
}

export interface InterMemo {
    to: string;
    from: string;
    msg: string;
}
