import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';
import * as _ from 'underscore';
import { StateModel } from './state-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isModalOpen = false;
  confirmPopup = false;
  noDrawPopup = false;
  currentPlayer = true;
  inTransition = false;
  currentState;
  modalMessage = "you Wins";
  data = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  dataset: StateModel;
  @ViewChildren("btns") btns: ElementRef[];
  ngOnInit() {
    const dataclone = JSON.parse(JSON.stringify(this.data))
    this.dataset = this.generateStates(dataclone, this.currentPlayer);
  }

  generateStates(data: number[][], player: boolean): StateModel {
    const state: StateModel = new StateModel(data);
    state.winner = this.isWon(data);
    if (state.winner !== 0) {
      if (state.winner === 1) {
        state.minmax = -100;
      } else if (state.winner === 2) {
        state.minmax = 100;
      } else {
        state.minmax = 0;
      }
      return state;
    }
    for (let i=0; i<3; i++) {
      for (let j=0; j<3; j++) {
        if (data[i][j] === 0) {
          const newData = JSON.parse(JSON.stringify(data));
          newData[i][j] = player ? 1 : 2;
          const newState = this.generateStates(newData, !player);
          state.children.push(newState);
        }
      }
    }
    if (state.children.some(s => s.winner !== 0)) {
      state.children = state.children.filter(s => s.winner !== 0);
    }
    if (player) {
      state.minmax = _.min(state.children, "minmax").minmax - 1; 
    } else {
      state.minmax = _.max(state.children, "minmax").minmax - 1;
    }
    state.minmax = state.minmax - 1;
    return state;
  }

  changeSet(event, x, y, isAi = false) {
    if (!this.inTransition && this.data[x][y] === 0) {
      this.inTransition = true;
      if(!isAi) {
        event.target.classList.add("active");
      } else {
        event.classList.add("active");
      }
      setTimeout(() => {
        this.inTransition = false;
        this.data[x][y] = this.currentPlayer ? 1 : 2;
        this.currentPlayer = !this.currentPlayer;
        let winner = this.isWon(this.data);
        if (winner != 0) {
          this.modalMessage = winner !== 4 ? (winner === 1? "You Won" : "AI Won") : "Draw";
          this.confirmPopup = false;
          this.isModalOpen = true;
        }
        if (!this.currentPlayer && winner === 0) { this.makeCPUMove(); }
      }, 220);
    }
  }

  isWon(data: number[][]) {
    const cArr: number[][] = [];
    let won = 0;
    data.forEach((arr) => { cArr.push(arr) });
    data.forEach((arr, index) => cArr.push(_.pluck(data, index)));
    cArr.push(data.map((value, index) => { return data[index][index]; }));
    cArr.push(data.map((value, index) => { return data[index][2 - index]; }));
    cArr.forEach((arr) => { if (arr[0] !== 0 && _.uniq(arr).length === 1) { won = arr[0]; } });
    if (won === 0) {
      let draw = true;
      data.forEach((arr) => arr.forEach((val) => { if (val === 0) { draw = false } }));
      return draw ? 4 : 0;
    } else {
      return won;
    }
  }

  getStr(data) {
    if (data === 0) {
      return "";
    } else if (data == 1) {
      return "O";
    } else if (data == 2) {
      return "X";
    }
  }

  closeModal(isReset) {
    this.isModalOpen = false;
    this.confirmPopup = false;
    if (isReset) {
      this.noDrawPopup = false;
      this.currentPlayer = true;
      this.currentState = undefined;
      this.data = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      this.btns.forEach((element) => { element.nativeElement.classList.remove("active") });
    } else {
      this.noDrawPopup = true;
    }
  }

  makeCPUMove() {
    const state: StateModel = !!this.currentState ? 
      this.findState(this.currentState):
      this.findState(this.dataset);
    let newState: StateModel = _.max(state.children, "minmax");
    let x = -1, y = -1;
    for (let i=0; i<3; i++) {
      for (let j=0; j<3; j++) {
        if (newState.state[i][j] !== 0 && this.data[i][j] === 0) {
          x = i;
          y = j;
        }
      }
    }
    if (x !== -1 && y !== -1) {
      this.currentState = newState;
      let element = document.getElementById("item"+x+y);
      this.changeSet(element, x, y, true);
    }
    if (this.currentState.children.length !== 0 && !this.noDrawPopup &&
      this.currentState.children.every(s => s.minmax >= -8 && s.minmax <= 8)) {
      this.confirmPopup = true;
      this.modalMessage = "Going to Draw";
      this.isModalOpen = true;
    }
  }

  findState(state: StateModel): StateModel {
    if (this.isSame(state.state, this.data)) {
      return state;
    } else {
      if (this.hasSimilarity(state.state, this.data)) {
        let obj;
        state.children.forEach((child) => obj = !obj ? this.findState(child) : obj);
        return obj;
      } else {
        return undefined;
      }
    }
  }

  isSame = (a, b) => JSON.stringify(a) === JSON.stringify(b)

  hasSimilarity(a: number[][], b: number[][]) {
    let count = 0;
    if (this.isSame(this.dataset.state, a)) {
      return true;
    }
    for (let i=0; i<3; i++) {
      for (let j=0; j<3; j++) {
        if (a[i][j] !== 0 && a[i][j] === b[i][j]) {
          count++;
        }
      }
    }
    return count > 0;
  }
}
