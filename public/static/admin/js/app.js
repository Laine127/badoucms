/**
 * 生成唯一标识
 * @param prefix 前缀
 * @returns 唯一标识
 */
function shortUuid(prefix = '') {
    const time = Date.now()
    const random = Math.floor(Math.random() * 1000000000)
    if (!window.unique) window.unique = 0
    window.unique++
    return prefix + '_' + random + window.unique + String(time)
}