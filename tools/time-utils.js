'use strict';

exports.formatDuration =
function (duration)
{
    const str = duration < 5e-3 ? '< 0.01 s' : `${duration.toFixed(2)} s`;
    return str;
};

exports.timeThis =
function (fn)
{
    const begin = process.hrtime();
    fn();
    const time = process.hrtime(begin);
    const duration = time[0] + time[1] / 1e9;
    return duration;
};

exports.timeThisAsync =
async function (fn)
{
    const begin = process.hrtime();
    await fn();
    const time = process.hrtime(begin);
    const duration = time[0] + time[1] / 1e9;
    return duration;
};
