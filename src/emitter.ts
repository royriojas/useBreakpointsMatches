// Inspired by https://github.com/bterlson/strict-event-emitter-types
export type InnerEEMethodReturnType<T, TValue, FValue> = T extends (...args: any[]) => any
  ? ReturnType<T> extends void | undefined
    ? FValue
    : TValue
  : FValue;

export type EEMethodReturnType<T, S extends string, TValue, FValue = void> = S extends keyof T
  ? InnerEEMethodReturnType<T[S], TValue, FValue>
  : FValue;

export type ListenerType<T> = [T] extends [(...args: infer U) => any]
  ? U
  : [T] extends [void]
  ? []
  : [T];

export type EmitterHandler<T, K extends keyof T> = {
  (...args: ListenerType<T[K]>): void;
};

// EventEmitter method overrides
export type OverriddenMethods<TEmitter, TEventRecord, TEmitRecord = TEventRecord> = {
  on<P extends keyof TEventRecord, T>(
    event: P,
    listener: EmitterHandler<TEventRecord, P>,
  ): EEMethodReturnType<TEmitter, 'on', T>;

  off<P extends keyof TEventRecord, T>(
    event: P,
    listener: EmitterHandler<TEventRecord, P>,
  ): EEMethodReturnType<TEmitter, 'off', T>;

  fire<P extends keyof TEmitRecord, T>(
    event: P,
    ...args: ListenerType<TEmitRecord[P]>
  ): EEMethodReturnType<TEmitter, 'fire', T>;
};

export type OverriddenKeys = keyof OverriddenMethods<any, any, any>;

export type TypedEmitter<
  TEmitterType,
  TEventRecord,
  TEmitRecord = TEventRecord,
  UnneededMethods extends Exclude<OverriddenKeys, keyof TEmitterType> = Exclude<
    OverriddenKeys,
    keyof TEmitterType
  >,
  NeededMethods extends Exclude<OverriddenKeys, UnneededMethods> = Exclude<
    OverriddenKeys,
    UnneededMethods
  >,
> =
  // Pick all the methods on the original type we aren't going to override
  Pick<TEmitterType, Exclude<keyof TEmitterType, OverriddenKeys>> &
    // Finally, pick the needed overrides (taking care not to add an override for a method
    // that doesn't exist)
    Pick<OverriddenMethods<TEmitterType, TEventRecord, TEmitRecord>, NeededMethods>;

export interface Handler<T> {
  (payload?: T): void;
}

export class Emitter {
  eventsMap = new Map<string, Set<Handler<any>>>();

  on = (eventName: string, handler: Handler<any>) => {
    if (typeof handler !== 'function') {
      throw new Error('handler must be a function');
    }

    let eventSet = this.eventsMap.get(eventName);

    if (!eventSet) {
      eventSet = new Set<Handler<any>>();
      this.eventsMap.set(eventName, eventSet);
    }

    eventSet.add(handler);
  };

  off = (eventName: string, handler: Handler<any>): boolean => {
    const eventSet = this.eventsMap.get(eventName);

    if (!eventSet) {
      return false;
    }

    return eventSet.delete(handler);
  };

  clear = (eventName: string) => {
    const eventSet = this.eventsMap.get(eventName);

    if (!eventSet) {
      return;
    }

    eventSet.clear();
  };

  fire = (eventName: string, payload?: any) => {
    const eventSet = this.eventsMap.get(eventName);
    if (!eventSet) {
      return;
    }

    eventSet.forEach((fn: Handler<any>) => {
      fn(payload);
    });
  };

  getEventCount = (eventName: string): number => {
    const eventSet = this.eventsMap.get(eventName);

    return eventSet?.size ?? 0;
  };
}

export const createEmitter = <EmitterEventsMap>() => {
  return new Emitter() as unknown as TypedEmitter<Emitter, EmitterEventsMap>;
};
