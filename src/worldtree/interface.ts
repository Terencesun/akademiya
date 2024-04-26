import type {
    InterAgent,
    InterMemo,
} from "../agent/interface";

export interface InterWTreeOpts {
    round?: number;
    tickThreshold?: number;
    memoFile?: string;
}


export interface InterWTree {
    agents: Record<string, InterAgent<any>>;
    round: number;    // 轮数限制(可以理解为天)
    tickThreshold: number;    // tick阈值，当经过多少tick算是一轮，100ms的整数倍
    msgs: Array<InterMsg>;
    costToken: Array<InterCost>;     // 花费的token记录列表
    lifeCycle: NormalFunc;
    msgDispatch: NormalFunc;
    persist: NormalFunc;
    recover: RecoverFunc;
    run: RunFunc;
    kill: NormalFunc;
}

export type NormalFunc = () => void;

export type RunFunc = (msg: InterMsg) => void;

export type RecoverFunc = (memo: Record<string, Array<InterMemo>>) => void;

export interface InterMsg {
    to: string;
    from: string;
    msg: string;
}

export interface InterCost {
    name: string;
    token: number;
}
