import _ from "lodash";

class Node {
    //{points, game, parent, children}
    constructor(nodeState = {}) {
        this.game = nodeState.game;
        this.parent = nodeState.parent;
        this.cardPlayed = nodeState.cardPlayed;
        this.children = nodeState.children;
    }
    addChild(node) {
        if (_.isNil(this.children)) {
            this.children = [node]
        } else {
            this.children.push(node)
        }
    }

}

export default Node;