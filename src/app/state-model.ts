export class StateModel {
    state: number[][];
    children: StateModel[];
    winner: number;
    minmax: number;

    constructor(data) {
        this.state = data;
        this.children = [];
        this.winner = 0;
    }
}
