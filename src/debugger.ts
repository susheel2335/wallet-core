import debug, { IDebugger } from 'debug';

export function create(key: string): IDebugger {
    return debug('Plark:' + key);
}
