import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { SourceNodeComponent } from './source-node/source-node.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxGraphModule,
  ],
  declarations: [AppComponent, SourceNodeComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
