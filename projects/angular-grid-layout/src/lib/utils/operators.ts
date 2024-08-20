import { NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

/** Runs source observable outside the zone */
export function ktdOutsideZone<T>(zone: NgZone) {
    return (source: Observable<T>) => {
        return new Observable<T>((observer) => {
            return zone.runOutsideAngular<Subscription>(() =>
                source.subscribe(observer),
            );
        });
    };
}

/** Rxjs operator that makes source observable to no emit any data */
export function ktdNoEmit() {
    return (source$: Observable<any>): Observable<any> => {
        return source$.pipe(filter(() => false));
    };
}

export const numberEqual = (a: number, b: number): boolean => a === b;

export const booleanEqual = (a: boolean, b: boolean): boolean => a === b;

export const booleanEqualityFn = () => ({
    equal: booleanEqual,
});
export const numberEqualityFn = () => ({
    equal: numberEqual,
});
