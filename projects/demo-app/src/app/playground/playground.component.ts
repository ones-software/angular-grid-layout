import { coerceNumberProperty } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
    Component,
    ElementRef,
    Inject,
    signal,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectChange } from '@angular/material/select';
import {
    KtdDragEnd,
    KtdDragStart,
    ktdGridCompact,
    KtdGridComponent,
    KtdGridLayout,
    KtdGridLayoutItem,
    KtdResizeEnd,
    KtdResizeStart,
    ktdTrackById,
} from '@katoid/angular-grid-layout';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { KtdGridBackgroundCfg } from '../../../../angular-grid-layout/src/lib/grid.definitions';
import { ktdArrayRemoveItem } from '../utils';

@Component({
    selector: 'ktd-playground',
    templateUrl: './playground.component.html',
    styleUrls: ['./playground.component.scss'],
})
export class KtdPlaygroundComponent {
    readonly grid = viewChild.required(KtdGridComponent);
    readonly trackById = ktdTrackById;

    readonly cols = signal(12);
    readonly rowHeight = signal(50);
    readonly rowHeightFit = signal(false);
    readonly gridHeight = signal<null | number>(null);
    readonly compactType = signal<'vertical' | 'horizontal' | null>('vertical');
    readonly layout = signal<KtdGridLayout>([
        { id: '0', x: 5, y: 0, w: 2, h: 3 },
        { id: '1', x: 2, y: 2, w: 1, h: 2 },
        { id: '2', x: 3, y: 7, w: 1, h: 2 },
        { id: '3', x: 2, y: 0, w: 3, h: 2 },
        { id: '4', x: 5, y: 3, w: 2, h: 3 },
        { id: '5', x: 0, y: 4, w: 1, h: 3 },
        { id: '6', x: 9, y: 0, w: 2, h: 4 },
        { id: '7', x: 9, y: 4, w: 2, h: 2 },
        { id: '8', x: 3, y: 2, w: 2, h: 5 },
        { id: '9', x: 7, y: 0, w: 1, h: 3 },
        { id: '10', x: 2, y: 4, w: 1, h: 4 },
        { id: '11', x: 0, y: 0, w: 2, h: 4 },
    ]);
    readonly transitions: { name: string; value: string }[] = [
        {
            name: 'ease',
            value: 'transform 500ms ease, width 500ms ease, height 500ms ease',
        },
        {
            name: 'ease-out',
            value: 'transform 500ms ease-out, width 500ms ease-out, height 500ms ease-out',
        },
        {
            name: 'linear',
            value: 'transform 500ms linear, width 500ms linear, height 500ms linear',
        },
        {
            name: 'overflowing',
            value: 'transform 500ms cubic-bezier(.28,.49,.79,1.35), width 500ms cubic-bezier(.28,.49,.79,1.35), height 500ms cubic-bezier(.28,.49,.79,1.35)',
        },
        {
            name: 'fast',
            value: 'transform 200ms ease, width 200ms linear, height 200ms linear',
        },
        {
            name: 'slow-motion',
            value: 'transform 1000ms linear, width 1000ms linear, height 1000ms linear',
        },
        { name: 'transform-only', value: 'transform 500ms ease' },
    ];
    readonly currentTransition = signal<string>(this.transitions[0].value);
    readonly placeholders: string[] = [
        'None',
        'Default',
        'Custom 1',
        'Custom 2',
        'Custom 3',
    ];

    readonly currentPlaceholder = signal<string>('Default');

    readonly dragStartThreshold = signal(0);
    readonly gap = signal(10);
    readonly autoScroll = signal(true);
    readonly disableDrag = signal(false);
    readonly disableResize = signal(false);
    readonly disableRemove = signal(false);
    readonly autoResize = signal(true);
    readonly preventCollision = signal(false);
    readonly isDragging = signal(false);
    readonly isResizing = signal(false);
    readonly showBackground = signal(false);

    readonly gridBackgroundVisibilityOptions = [
        'never',
        'always',
        'whenDragging',
    ];
    gridBackgroundConfig: Required<KtdGridBackgroundCfg> = {
        show: 'always',
        borderColor: 'rgba(255, 128, 0, 0.25)',
        gapColor: 'transparent',
        borderWidth: 1,
        rowColor: 'rgba(128, 128, 128, 0.10)',
        columnColor: 'rgba(128, 128, 128, 0.10)',
    };

    constructor(
        public elementRef: ElementRef,
        @Inject(DOCUMENT) public document: Document,
    ) {
        merge(
            fromEvent(window, 'resize'),
            fromEvent(window, 'orientationchange'),
        )
            .pipe(
                debounceTime(50),
                filter(() => this.autoResize()),
                takeUntilDestroyed(),
            )
            .subscribe(() => {
                this.grid().resize();
            });
    }

    onDragStarted(event: KtdDragStart) {
        this.isDragging.set(true);
    }

    onResizeStarted(event: KtdResizeStart) {
        this.isResizing.set(true);
    }

    onDragEnded(event: KtdDragEnd) {
        this.isDragging.set(false);
    }

    onResizeEnded(event: KtdResizeEnd) {
        this.isResizing.set(false);
    }

    onLayoutUpdated(layout: KtdGridLayout) {
        console.log('on layout updated', layout);
        this.layout.set(layout);
    }

    onCompactTypeChange(change: MatSelectChange) {
        console.log('onCompactTypeChange', change);
        this.compactType.set(change.value);
    }

    onTransitionChange(change: MatSelectChange) {
        console.log('onTransitionChange', change);
        this.currentTransition.set(change.value);
    }

    onAutoScrollChange(checked: boolean) {
        this.autoScroll.set(checked);
    }

    onDisableDragChange(checked: boolean) {
        this.disableDrag.set(checked);
    }

    onDisableResizeChange(checked: boolean) {
        this.disableResize.set(checked);
    }

    onShowBackgroundChange(checked: boolean) {
        this.showBackground.set(checked);
    }

    onDisableRemoveChange(checked: boolean) {
        this.disableRemove.set(checked);
    }

    onAutoResizeChange(checked: boolean) {
        this.autoResize.set(checked);
    }

    onPreventCollisionChange(checked: boolean) {
        this.preventCollision.set(checked);
    }

    onColsChange(event: Event) {
        this.cols.set(
            coerceNumberProperty((event.target as HTMLInputElement).value),
        );
    }

    onRowHeightChange(event: Event) {
        this.rowHeight.set(
            coerceNumberProperty((event.target as HTMLInputElement).value),
        );
    }

    onRowHeightFitChange(change: MatCheckboxChange) {
        this.rowHeightFit.set(change.checked);
    }

    onGridHeightChange(event: Event) {
        this.gridHeight.set(
            coerceNumberProperty((event.target as HTMLInputElement).value),
        );
    }

    onDragStartThresholdChange(event: Event) {
        this.dragStartThreshold.set(
            coerceNumberProperty((event.target as HTMLInputElement).value),
        );
    }

    onPlaceholderChange(change: MatSelectChange) {
        this.currentPlaceholder.set(change.value);
    }

    onGapChange(event: Event) {
        this.gap.set(
            coerceNumberProperty((event.target as HTMLInputElement).value),
        );
    }

    generateLayout() {
        const layout: KtdGridLayout = [];
        for (let i = 0; i < this.cols(); i++) {
            const y = Math.ceil(Math.random() * 4) + 1;
            layout.push({
                x:
                    Math.round(
                        Math.random() * Math.floor(this.cols() / 2 - 1),
                    ) * 2,
                y: Math.floor(i / 6) * y,
                w: 2,
                h: y,
                id: i.toString(),
                // static: Math.random() < 0.05
            });
        }
        this.layout.set(
            ktdGridCompact(layout, this.compactType(), this.cols()),
        );
        console.log('generateLayout', this.layout);
    }

    /** Adds a grid item to the layout */
    addItemToLayout() {
        const maxId = this.layout().reduce(
            (acc, cur) => Math.max(acc, parseInt(cur.id, 10)),
            -1,
        );
        const nextId = maxId + 1;

        const newLayoutItem: KtdGridLayoutItem = {
            id: nextId.toString(),
            x: -1,
            y: -1,
            w: 2,
            h: 2,
        };

        // Important: Don't mutate the array, create new instance. This way notifies the Grid component that the layout has changed.
        this.layout.set([newLayoutItem, ...this.layout()]);
        this.layout.set(
            ktdGridCompact(this.layout(), this.compactType(), this.cols()),
        );
    }

    /**
     * Fired when a mousedown happens on the remove grid item button.
     * Stops the event from propagating an causing the drag to start.
     * We don't want to drag when mousedown is fired on remove icon button.
     */
    stopEventPropagation(event: Event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /** Removes the item from the layout */
    removeItem(id: string) {
        // Important: Don't mutate the array. Let Angular know that the layout has changed creating a new reference.
        this.layout.set(
            ktdArrayRemoveItem(this.layout(), (item) => item.id === id),
        );
    }

    updateGridBgBorderWidth(borderWidth: string) {
        this.gridBackgroundConfig = {
            ...this.gridBackgroundConfig,
            borderWidth: Number(borderWidth),
        };
    }

    updateGridBgColor(color: string, property: string) {
        this.gridBackgroundConfig = {
            ...this.gridBackgroundConfig,
            [property]: color,
        };
    }

    getCurrentBackgroundVisibility() {
        return this.gridBackgroundConfig?.show ?? 'never';
    }

    gridBackgroundShowChange(change: MatSelectChange) {
        this.gridBackgroundConfig = {
            ...this.gridBackgroundConfig,
            show: change.value as Required<KtdGridBackgroundCfg>['show'],
        };
    }
}
