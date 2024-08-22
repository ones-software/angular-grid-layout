import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

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
