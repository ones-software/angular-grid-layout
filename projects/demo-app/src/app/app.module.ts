import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { KtdAppComponent } from './app.component';
import { KtdAppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
    declarations: [
        KtdAppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KtdAppRoutingModule,
        HttpClientModule,
        MatIconModule,
        MatButtonModule
    ],
    providers: [],
    bootstrap: [KtdAppComponent]
})
export class KtdAppModule {}
