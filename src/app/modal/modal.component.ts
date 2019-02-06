import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @Input("message") message="";
  @Output() closeEvent = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  close(isReset)
  {
    this.closeEvent.emit(isReset);
  }
}
