import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import * as _ from 'underscore';
import { StateModel } from './state-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isModalOpen = false;
  currentPlayer = true;
  inTransition = false;
  currentState;
  modalMessage = "O Wins";
  data = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  dataset: StateModel;
  @ViewChildren("btns") btns: ElementRef[];
  ngOnInit() {
    const dataclone = JSON.parse(JSON.stringify(this.data))
    this.dataset = this.generateStates(dataclone, this.currentPlayer);
    console.log(this.dataset);
  }

  generateStates(data: number[][], player: Boolean): StateModel {
    const state: StateModel = new StateModel(data);
    const children = [];
    state.winner = this.isWonAI(data);
    if (state.winner !== 0) {
      state.heuristic = state.winner === 1 ? 0 : 1;
      return state;
    }
    let heuristic = 0;
    for (let i=0; i<3; i++) {
      for (let j=0; j<3; j++) {
        if (data[i][j] === 0) {
          const newData = JSON.parse(JSON.stringify(data));
          newData[i][j] = player ? 1 : 2;
          const newState = this.generateStates(newData, !player);
          heuristic += newState.heuristic;
          children.push(newState);
        }
      }
    }
    state.children = children;
    state.heuristic = heuristic;
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
        let winner = this.isWon();
        if (winner != 0) {
          this.modalMessage = winner !== 4 ? (winner === 1? "You Won" : "AI Won") : "Draw";
          this.isModalOpen = true;
        }
        if (!this.currentPlayer && winner === 0) { this.makeCPUMove(); }
      }, 220);
    }
  }

  isWon() {
    const cArr: number[][] = [];
    let won = 0;
    this.data.forEach((arr) => { cArr.push(arr) });
    this.data.forEach((arr, index) => cArr.push(_.pluck(this.data, index)));
    cArr.push(this.data.map((value, index) => { return this.data[index][index]; }));
    cArr.push(this.data.map((value, index) => { return this.data[index][2 - index]; }));
    cArr.forEach((arr) => { if (arr[0] !== 0 && _.uniq(arr).length === 1) { won = arr[0]; } });
    if (won === 0) {
      let draw = true;
      this.data.forEach((arr) => arr.forEach((val) => { if (val === 0) { draw = false } }));
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
    this.currentPlayer = true;
    this.currentState = undefined;
    if (isReset) {
      this.data = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      this.btns.forEach((element) => { element.nativeElement.classList.remove("active") });
    }
  }

  makeCPUMove() {
    let isTurnDone = false;
    const state: StateModel = !!this.currentState ? 
      this.findState(this.currentState):
      this.findState(this.dataset);
    if (state.hasChild()) {
      let newState = state.children[0];
      state.children.forEach((child) => {
        if (newState.heuristic < child.heuristic &&
          newState.winner !== 2) {
          newState = child;
        }
        if (child.winner === 2) {
          newState = child;
        }
      });
      let x = -1;
      let y = -1;
      for (let i=0; i<3; i++) {
        for (let j=0; j<3; j++) {
          if (newState.state[i][j] !== 0 && this.data[i][j] === 0) {
            x = i;
            y = j;
          }
        }
      }
      if (x !== -1 && y !== -1) {
        isTurnDone = true;
        this.currentState = newState;
        let element = document.getElementById("item"+x+y);
        this.changeSet(element, x, y, true);
      }
    }
    while (!isTurnDone) {
      let i = Math.floor((Math.random() * 8));
      let x = Math.floor(i / 3);
      let y = i % 3;
      if(this.data[x][y] == 0) {
        isTurnDone = true;
        let element = document.getElementById("item"+x+y);
        this.changeSet(element, x, y, true);
      }
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

  isWonAI(data: number[][]) {
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
}