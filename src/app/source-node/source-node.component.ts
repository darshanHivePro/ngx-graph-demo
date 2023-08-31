import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-source-node',
  templateUrl: './source-node.component.html',
  styleUrls: ['./source-node.component.css'],
})
export class SourceNodeComponent {
  @Input() node:any;
}
