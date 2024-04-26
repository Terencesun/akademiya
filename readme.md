## Akademiya（教令院）
---
> nodejs 多智能体协同框架
> 
> 项目刚开，欢迎issue和pr

### 概念
- 智能体(Agent)
智能体可以理解为一种可以较为智能的一类实体，用于解决某一范围内的问题。可以类比人类社会中的某一个工种

- 智能体的特性
这里借用Metagpt的概念`智能体 = 大语言模型(LLM) + 观察 + 思考 + 行动 + 记忆`
    - LLM：不用解释过多
    - 观察：也就是智能体内部的信息流动的感知
    - 思考：对于观察和记忆的事物，进行逻辑推理和决策，这可以通过LLM进行
    - 行动：也就是一个智能体开始响应
    - 记忆：当行动完成，智能体对于完成的结果或过程可以进行记忆
> 对于教令院来说，智能体的概念被泛化
> 
> `智能体 = 信息 + 思考 + 行动 + 记忆`
> 
> 这里省略了大模型，目的是在思考那里，人可以直接参与，比如这个智能体直接通过代码解决这个问题，并不需要大模型

- 世界树
  - 管理智能体的地方，记录了他们的记忆

- 与metagpt的不同点
  - 引入了真实世界时间，轮数的概念可以直接理解为天数
  - 引入了智能体Tick时间，就像人一样，每个人的时钟可能是不一样的，智能体也是
  - 智能体会不断Tick，在Tick的过程中，完成行动
  - 世界时间也会不断Tick，向各个智能体传递信息

### 使用方法
```
npm install akademiya --save
```

#### 介绍两个类

##### Agent
```typescript
interface InterAgent<ActionModel> {
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

// 会用到的方法，大致就是
// action 定义智能体的行为
// talkTo 智能体跟世界树中另外的智能体通讯
// costRecord 记录token的使用，需要主动调用，才能统计token花费
```

##### Worldtree
```typescript
interface InterWTree {
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

// 会用到的方法，大致就是
// recover 恢复进度，世界树会在每一个round，进行记忆备份，当程序意外终止，可以调用这个方法，把记忆的json传进去即可
// run  开启世界树
// kill 关闭世界树
```

#### 一个例子(命题作诗)
[例子](https://github.com/Terencesun/akademiya/tree/master/example)

### Licence
MIT，如有引用或借鉴，请标注，谢谢
