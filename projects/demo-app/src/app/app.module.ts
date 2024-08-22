import {
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import {
    NgModule,
    provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KtdAppRoutingModule } from './app-routing.module';
import { KtdAppComponent } from './app.component';

@NgModule({
    declarations: [KtdAppComponent],
    bootstrap: [KtdAppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KtdAppRoutingModule,
        MatIconModule,
        MatButtonModule,
    ],
    providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideExperimentalZonelessChangeDetection(),
    ],
})
export class KtdAppModule {}
