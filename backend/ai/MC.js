import {Game} from "../../briscola/js/Game.js"
import _ from "lodash";
import Node from './Node'

function MC(node, options = {}) {
    const rootNode = node;

    const MAX_DEPTH = options.MAX_DEPTH ||3;


    const playerIndexToAct = node.game.getPlayerIndexToAct();
    function DFS(node, cb) {
        node.discovered = true;
        cb(node)
        if (node.children) {
            node.children.forEach(childNode => {
                if (!childNode.discovered) {
                    cb(node)
                    DFS(childNode, cb)
                }
            })
        }
    }
    function onlyOneCardInHand() {
        return node.game.players[playerIndexToAct].hand.cards.length === 1
    }
    function getLeafWithMostPoints() {
        const leaves = getLeaves()
        const leafWithMostPoints = leaves.sort( (leafA, leafB) => {
            const leafAPoints = leafA.game.players[playerIndexToAct].pile.countPoints()
            const leafBPoints = leafB.game.players[playerIndexToAct].pile.countPoints()
            return leafAPoints - leafBPoints
        })[leaves.length - 1];
        return leafWithMostPoints;
    }

    function getLeaves(){
        const node = _.cloneDeep(rootNode);

        const leaves = [];
        DFS(node, (node)=>{
            if(node.children == undefined){
                leaves.push(node)
            }
        })

        return leaves
    }
    function getNextCardToPlay() {
        if(onlyOneCardInHand()){
            return node.game.players[playerIndexToAct].hand.cards[0];
        }

        let leafWithMostPoints = getLeafWithMostPoints();
        if(leafWithMostPoints && leafWithMostPoints.parent) {
            while (!_.isNil(leafWithMostPoints.parent.parent)) {
                leafWithMostPoints = leafWithMostPoints.parent
            }
        }

        const nodeWithBestAction = leafWithMostPoints;
        return nodeWithBestAction.cardPlayed;
    }

    function buildTree(node, level = 0) {
        const game = _.cloneDeep(node.game);
        const firstLevelGame = _.cloneDeep(game);

        firstLevelGame.players[firstLevelGame.currentPlayerToActByIndex].hand.cards.forEach((card) => {
            const firstLevelGameToModif = _.cloneDeep(firstLevelGame);
            const firstCardPlayed = card;
            firstLevelGameToModif.playCard(firstCardPlayed, firstLevelGame.getPlayerIndexToAct());
            const currPlayerToActIndex = firstLevelGameToModif.getPlayerIndexToAct();

            const secondLevelGame = _.cloneDeep(firstLevelGameToModif);
            secondLevelGame.players[currPlayerToActIndex].hand.cards.forEach((card) => {

                const secondLevelGameToModif = _.cloneDeep(secondLevelGame)
                secondLevelGameToModif.playCard(card, currPlayerToActIndex);
                const newNode = new Node({game: secondLevelGameToModif, parent: node, cardPlayed: firstCardPlayed});

                node.addChild(newNode);

                if (level < MAX_DEPTH && !secondLevelGameToModif.isGameOver()) {
                    buildTree(newNode,level + 1)
                }
            })
        })
    }

    return {getNextCardToPlay, buildTree}
}
export default MC;

