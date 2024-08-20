import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KtdPlaygroundComponent } from './playground.component';
import { RouterModule, Routes } from '@angular/router';
import { KtdGridModule } from '@katoid/angular-grid-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { KtdFooterComponent } from '../components/footer/footer.component';
import { ColorPickerModule } from "ngx-color-picker";

const routes: Routes = [
    {
        path: 'playground',
        component: KtdPlaygroundComponent,
        data: {title: 'Angular Grid Layout - Playground'}
    },
];


@NgModule({
    declarations: [KtdPlaygroundComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        KtdGridModule,
        MatButtonModule,
        MatSelectModule,
        MatCheckboxModule,
        MatInputModule,
        MatChipsModule,
        KtdFooterComponent,
        ColorPickerModule
    ]
})
export class KtdPlaygroundModule {}
