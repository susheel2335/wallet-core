import Bottleneck from 'bottleneck';

const limiter = new Bottleneck(1, 300);

/**
 * @param {() => PromiseLike<R>} cb
 * @param {number} priority
 * @returns {Promise<R>}
 */
export function wrapLimiterMethod<R>(cb: () => PromiseLike<R>, priority: number = 5): Promise<R> {
    return limiter.schedulePriority(priority, cb)
}