import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KtdRealLifeExampleComponent } from './real-life-example.component';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { KtdGridModule } from '@katoid/angular-grid-layout';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { KtdTableSortingComponent } from './table-sorting/table-sorting.component';
import { MatSortModule } from '@angular/material/sort';
import { KtdFooterComponent } from '../components/footer/footer.component';

const routes: Routes = [
    {
        path: 'real-life-example',
        component: KtdRealLifeExampleComponent,
        data: {title: 'Angular Grid Layout - Real life example'}
    },
];

@NgModule({
    declarations: [
        KtdRealLifeExampleComponent,
        KtdTableSortingComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatIconModule,
        KtdGridModule,
        NgxChartsModule,
        MatCardModule,
        MatTableModule,
        MatSortModule,
        KtdFooterComponent
    ]
})
export class KtdRealLifeExampleModule {}
