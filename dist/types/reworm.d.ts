import React, { Component } from 'react';
declare type PrevState<T> = (prevState: T) => T;
declare type GetFn<T> = (state: T) => React.ReactNode;
declare type SubscribeFn<T> = (state: T) => any;
interface State<T> {
    get: (fn: GetFn<T>) => React.ReactNode;
    set: (next: T | PrevState<T>) => void;
    select: <S = any>(selector: (state: T) => S) => (fn: GetFn<S>) => React.ReactNode;
    subscribe: (fn: SubscribeFn<T>) => () => void;
}
export declare class Provider extends Component {
    state: Record<string, any>;
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: any, nextState: any): boolean;
    render(): React.ReactNode;
    private handleUpdate;
}
export declare function create<T = any>(initial?: T): State<T>;
export {};
