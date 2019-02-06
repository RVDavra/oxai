export class StateModel {
    state: number[][];
    children: StateModel[];
    winner: number;
    heuristic: number;

    hasChild = () => this.children.length !== 0;

    constructor(data) {
        this.state = data;
        this.children = [];
        this.winner = 0;
        this.heuristic = 0;
    }
}
