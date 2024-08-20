import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    Inject,
    input,
    NgZone,
    OnDestroy,
    OnInit,
    QueryList,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { iif, merge, NEVER, Observable, Subject, Subscription } from 'rxjs';
import {
    exhaustMap,
    filter,
    map,
    startWith,
    switchMap,
    take,
    takeUntil,
} from 'rxjs/operators';
import {
    KTD_GRID_DRAG_HANDLE,
    KtdGridDragHandle,
} from '../directives/drag-handle';
import {
    KTD_GRID_ITEM_PLACEHOLDER,
    KtdGridItemPlaceholder,
} from '../directives/placeholder';
import {
    KTD_GRID_RESIZE_HANDLE,
    KtdGridResizeHandle,
} from '../directives/resize-handle';
import {
    GRID_ITEM_GET_RENDER_DATA_TOKEN,
    KtdGridItemRenderDataTokenType,
} from '../grid.definitions';
import { KtdGridService } from '../grid.service';
import { ktdOutsideZone } from '../utils/operators';
import {
    ktdMouseOrTouchDown,
    ktdMouseOrTouchEnd,
    ktdPointerClient,
} from '../utils/pointer.utils';

@Component({
    selector: 'ktd-grid-item',
    templateUrl: './grid-item.component.html',
    styleUrls: ['./grid-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KtdGridItemComponent
    implements OnInit, OnDestroy, AfterContentInit
{
    /** Elements that can be used to drag the grid item. */
    @ContentChildren(KTD_GRID_DRAG_HANDLE, { descendants: true })
    _dragHandles: QueryList<KtdGridDragHandle>;
    @ContentChildren(KTD_GRID_RESIZE_HANDLE, { descendants: true })
    _resizeHandles: QueryList<KtdGridResizeHandle>;
    @ViewChild('resizeElem', { static: true, read: ElementRef })
    resizeElem: ElementRef;

    /** Template ref for placeholder */
    @ContentChild(KTD_GRID_ITEM_PLACEHOLDER)
    placeholder: KtdGridItemPlaceholder;

    /** Min and max size input properties. Any of these would 'override' the min/max values specified in the layout. */
    readonly minW = input<number>();
    readonly minH = input<number>();
    readonly maxW = input<number>();
    readonly maxH = input<number>();

    /** CSS transition style. Note that for more performance is preferable only make transition on transform property. */
    readonly transition = input<string>(
        'transform 500ms ease, width 500ms ease, height 500ms ease',
    );

    /** Id of the grid item. This property is strictly compulsory. */
    readonly id = input.required<string>();

    /** Minimum amount of pixels that the user should move before it starts the drag sequence. */

    readonly dragStartThreshold = input<number>(0);

    /** Whether the item is draggable or not. Defaults to true. Does not affect manual dragging using the startDragManually method. */
    readonly draggable = input<boolean>(false);
    private _draggable$ = toObservable(this.draggable);

    private _manualDragEvents$: Subject<MouseEvent | TouchEvent> = new Subject<
        MouseEvent | TouchEvent
    >();

    /** Whether the item is resizable or not. Defaults to true. */
    readonly resizable = input<boolean>(false);
    private _resizable$ = toObservable(this.resizable);

    private dragStartSubject = new Subject<MouseEvent | TouchEvent>();
    private resizeStartSubject = new Subject<MouseEvent | TouchEvent>();
    readonly dragStart$ = this.dragStartSubject.asObservable();
    readonly resizeStart$ = this.resizeStartSubject.asObservable();

    private subscriptions: Subscription[] = [];

    constructor(
        public elementRef: ElementRef,
        private gridService: KtdGridService,
        private renderer: Renderer2,
        private ngZone: NgZone,
        @Inject(GRID_ITEM_GET_RENDER_DATA_TOKEN)
        private getItemRenderData: KtdGridItemRenderDataTokenType,
    ) {}

    ngOnInit() {
        const gridItemRenderData = this.getItemRenderData(this.id())!;
        this.setStyles(gridItemRenderData);
    }

    ngAfterContentInit() {
        this.subscriptions.push(
            this._dragStart$().subscribe(this.dragStartSubject),
            this._resizeStart$().subscribe(this.resizeStartSubject),
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    /**
     * To manually start dragging, route the desired pointer events to this method.
     * Dragging initiated by this method will work regardless of the value of the draggable Input.
     * It is the caller's responsibility to call this method with only the events that are desired to cause a drag.
     * For example, if you only want left clicks to cause a drag, it is your responsibility to filter out other mouse button events.
     * @param startEvent The pointer event that should initiate the drag.
     */
    startDragManually(startEvent: MouseEvent | TouchEvent) {
        this._manualDragEvents$.next(startEvent);
    }

    setStyles({
        top,
        left,
        width,
        height,
    }: {
        top: string;
        left: string;
        width?: string;
        height?: string;
    }) {
        // transform is 6x times faster than top/left
        this.renderer.setStyle(
            this.elementRef.nativeElement,
            'transform',
            `translateX(${left}) translateY(${top})`,
        );
        this.renderer.setStyle(
            this.elementRef.nativeElement,
            'display',
            `block`,
        );
        this.renderer.setStyle(
            this.elementRef.nativeElement,
            'transition',
            this.transition(),
        );
        if (width != null) {
            this.renderer.setStyle(
                this.elementRef.nativeElement,
                'width',
                width,
            );
        }
        if (height != null) {
            this.renderer.setStyle(
                this.elementRef.nativeElement,
                'height',
                height,
            );
        }
    }

    private _dragStart$(): Observable<MouseEvent | TouchEvent> {
        return merge(
            this._manualDragEvents$,
            this._draggable$.pipe(
                switchMap((draggable) => {
                    if (!draggable) {
                        return NEVER;
                    }
                    return this._dragHandles.changes.pipe(
                        startWith(this._dragHandles),
                        switchMap(
                            (dragHandles: QueryList<KtdGridDragHandle>) => {
                                return iif(
                                    () => dragHandles.length > 0,
                                    merge(
                                        ...dragHandles
                                            .toArray()
                                            .map((dragHandle) =>
                                                ktdMouseOrTouchDown(
                                                    dragHandle.element
                                                        .nativeElement,
                                                    1,
                                                ),
                                            ),
                                    ),
                                    ktdMouseOrTouchDown(
                                        this.elementRef.nativeElement,
                                        1,
                                    ),
                                );
                            },
                        ),
                    );
                }),
            ),
        ).pipe(
            exhaustMap((startEvent) => {
                // If the event started from an element with the native HTML drag&drop, it'll interfere
                // with our own dragging (e.g. `img` tags do it by default). Prevent the default action
                // to stop it from happening. Note that preventing on `dragstart` also seems to work, but
                // it's flaky and it fails if the user drags it away quickly. Also note that we only want
                // to do this for `mousedown` since doing the same for `touchstart` will stop any `click`
                // events from firing on touch devices.
                if (
                    startEvent.target &&
                    (startEvent.target as HTMLElement).draggable &&
                    startEvent.type === 'mousedown'
                ) {
                    startEvent.preventDefault();
                }

                const startPointer = ktdPointerClient(startEvent);
                return this.gridService.mouseOrTouchMove$(document).pipe(
                    takeUntil(ktdMouseOrTouchEnd(document, 1)),
                    ktdOutsideZone(this.ngZone),
                    filter((moveEvent) => {
                        moveEvent.preventDefault();
                        const movePointer = ktdPointerClient(moveEvent);
                        const distanceX = Math.abs(
                            startPointer.clientX - movePointer.clientX,
                        );
                        const distanceY = Math.abs(
                            startPointer.clientY - movePointer.clientY,
                        );
                        // When this conditions returns true mean that we are over threshold.
                        return (
                            distanceX + distanceY >= this.dragStartThreshold()
                        );
                    }),
                    take(1),
                    // Return the original start event
                    map(() => startEvent),
                );
            }),
        );
    }

    private _resizeStart$(): Observable<MouseEvent | TouchEvent> {
        return this._resizable$.pipe(
            switchMap((resizable) => {
                if (!resizable) {
                    // Side effect to hide the resizeElem if resize is disabled.
                    this.renderer.setStyle(
                        this.resizeElem.nativeElement,
                        'display',
                        'none',
                    );
                    return NEVER;
                } else {
                    return this._resizeHandles.changes.pipe(
                        startWith(this._resizeHandles),
                        switchMap(
                            (resizeHandles: QueryList<KtdGridResizeHandle>) => {
                                if (resizeHandles.length > 0) {
                                    // Side effect to hide the resizeElem if there are resize handles.
                                    this.renderer.setStyle(
                                        this.resizeElem.nativeElement,
                                        'display',
                                        'none',
                                    );
                                    return merge(
                                        ...resizeHandles
                                            .toArray()
                                            .map((resizeHandle) =>
                                                ktdMouseOrTouchDown(
                                                    resizeHandle.element
                                                        .nativeElement,
                                                    1,
                                                ),
                                            ),
                                    );
                                } else {
                                    this.renderer.setStyle(
                                        this.resizeElem.nativeElement,
                                        'display',
                                        'block',
                                    );
                                    return ktdMouseOrTouchDown(
                                        this.resizeElem.nativeElement,
                                        1,
                                    );
                                }
                            },
                        ),
                    );
                }
            }),
        );
    }
}
