import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ktdNormalizePassiveListenerOptions } from './utils/passive-listeners';

/** Event options that can be used to bind an active, capturing event. */
const activeCapturingEventOptions = ktdNormalizePassiveListenerOptions({
    passive: false,
    capture: true,
});

@Injectable({ providedIn: 'root' })
export class KtdGridService {
    touchMove$: Observable<TouchEvent>;
    private touchMoveSubject = new Subject<TouchEvent>();

    constructor() {
        this.touchMove$ = this.touchMoveSubject.asObservable();
        this.registerTouchMoveSubscription();
    }

    mouseOrTouchMove$(element): Observable<MouseEvent | TouchEvent> {
        return merge(
            this.touchMove$,
            fromEvent<MouseEvent>(
                element,
                'mousemove',
                activeCapturingEventOptions as AddEventListenerOptions,
            ), // TODO: Fix rxjs typings, boolean should be a good param too.
        );
    }

    private registerTouchMoveSubscription() {
        // The `touchmove` event gets bound once, ahead of time, because WebKit
        // won't preventDefault on a dynamically-added `touchmove` listener.
        // See https://bugs.webkit.org/show_bug.cgi?id=184250.
        fromEvent(
            document,
            'touchmove',
            activeCapturingEventOptions as AddEventListenerOptions,
        ) // TODO: Fix rxjs typings, boolean should be a good param too.
            .pipe(
                filter(
                    (touchEvent: TouchEvent) => touchEvent.touches.length === 1,
                ),
                takeUntilDestroyed(),
            )
            .subscribe((touchEvent: TouchEvent) =>
                this.touchMoveSubject.next(touchEvent),
            );
    }
}
