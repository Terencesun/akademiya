import type {
    InterCost
} from "../worldtree/interface";

export const sumToken = (costToken: Array<InterCost>) => {
    let total = 0;
    for (const meta of costToken) {
        total += meta.token;
    }
    return total;
};
