import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 5000,
});

/**
 * @param {() => PromiseLike<R>}    cb
 * @param {number}                  priority
 *
 * @returns {Promise<R>}
 */
export function wrapLimiterMethod<R>(cb: () => PromiseLike<R>, priority: number = 5): Promise<R> {
    return limiter.schedule({ priority: priority }, cb);
}
