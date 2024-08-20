import { DOCUMENT } from '@angular/common';
import {
    Component,
    Inject,
    OnDestroy,
    OnInit,
    signal,
    viewChild,
} from '@angular/core';
import {
    KtdGridComponent,
    KtdGridLayout,
    ktdTrackById,
} from '@katoid/angular-grid-layout';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'ktd-custom-handles',
    templateUrl: './custom-handles.component.html',
    styleUrls: ['./custom-handles.component.scss'],
})
export class KtdCustomHandlesComponent implements OnInit, OnDestroy {
    readonly grid = viewChild.required(KtdGridComponent);
    readonly trackById = ktdTrackById;
    readonly layout = signal<KtdGridLayout>([
        { id: '0', x: 0, y: 0, w: 3, h: 3 },
        { id: '1', x: 3, y: 0, w: 3, h: 4 },
        { id: '2', x: 6, y: 0, w: 3, h: 5 },
        { id: '3', x: 9, y: 0, w: 3, h: 6 },
    ]);

    private resizeSubscription: Subscription;

    constructor(@Inject(DOCUMENT) public document: Document) {}

    ngOnInit() {
        this.resizeSubscription = merge(
            fromEvent(window, 'resize'),
            fromEvent(window, 'orientationchange'),
        )
            .pipe(debounceTime(50))
            .subscribe(() => {
                this.grid().resize();
            });
    }

    ngOnDestroy() {
        this.resizeSubscription.unsubscribe();
    }

    onLayoutUpdated(layout: KtdGridLayout) {
        this.layout.set(layout);
    }
}
