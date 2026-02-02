'use strict';

const timeUtils = require('./time-utils');

function byteCount(size, width)
{
    const str = `${String(size).padStart(width)}${size === 1 ? ' byte' : ' bytes'}`;
    return str;
}

function createDiagnosticReport(perfLog)
{
    const reportParts =
    perfLog.map(perfInfoList => formatPerfInfoList(perfInfoList, '', ['', '']));
    reportParts.unshift
    (`\nStrategy                    Status         Length  Time (ms)\n${'─'.repeat(60)}\n`);
    const report = reportParts.join('');
    return report;
}

function createReport(originalSize, screwedSize, encodingTime)
{
    const width = Math.max(widthOf(originalSize), widthOf(screwedSize));
    const expansionFactorStr = originalSize ? (screwedSize / originalSize).toFixed(2) : '-';
    const encodingTimeStr = timeUtils.formatDuration(encodingTime);
    const report =
    `Original size:    ${byteCount(originalSize, width)
    }\nScrewed size:     ${byteCount(screwedSize, width)
    }\nExpansion factor: ${expansionFactorStr
    }\nEncoding time:    ${encodingTimeStr}`;
    return report;
}

function formatCodingLog(perfLog, padding, nextCodingLog)
{
    padding += nextCodingLog ? '│' : ' ';
    let str = '';
    const count = perfLog.length;
    for (let index = 0; index < count; ++index)
    {
        const perfInfoList = perfLog[index];
        const nextPerfInfoList = index < count - 1;
        str += formatPerfInfoList(perfInfoList, padding, nextPerfInfoList ? '├│' : '└ ');
    }
    if (nextCodingLog)
        str += `${padding}\n`;
    return str;
}

function formatInt(int)
{
    const str = int === undefined ? '-' : String(int);
    return str;
}

function formatPerfInfoList(perfInfoList, padding, paddingChars)
{
    // In the current implementation, perfInfoList.name can be either undefined, a unit path or
    // "legend".
    let str = `${padding}${paddingChars[0]}${perfInfoList.name || '(default)'}\n`;
    padding += paddingChars[1];
    const count = perfInfoList.length;
    const paddingLength = padding.length;
    for (let index = 0; index < count; ++index)
    {
        const perfInfo = perfInfoList[index];
        const next = index < count - 1;
        str +=
        `${padding
        }${next ? '├' : '└'
        }${perfInfo.strategyName.padEnd(27 - paddingLength)
        }${perfInfo.status.padEnd(10)
        }${formatInt(perfInfo.outputLength).padStart(11)
        }${formatInt(perfInfo.time).padStart(11)
        }\n`;
        const { perfLog } = perfInfo;
        if (perfLog)
            str += formatCodingLog(perfLog, padding, next);
    }
    return str;
}

function parseCommandLine(argv)
{
    function parseFeatures()
    {
        const arg2 = argv[++index];
        if (arg2 === undefined)
            throw Error(`option ${quote(arg)} requires an argument`);
        options.features = arg2.trim().split(/(?:\s+|\s*,\s*)/);
    }

    function parseFlag(char)
    {
        switch (char)
        {
        case 'c':
        case 'w':
            wrapMode = 'call';
            break;
        case 'd':
            options.perfInfo = { };
            break;
        case 'e':
            wrapMode = 'eval';
            break;
        case 't':
            options.trimCode = true;
            break;
        case 'x':
            express = true;
            break;
        default:
            throw Error(`unrecognized flag ${quote(char)}`);
        }
    }

    function parseRunAs()
    {
        const arg2 = argv[++index];
        if (arg2 === undefined)
            throw Error(`option ${quote(arg)} requires an argument`);
        options.runAs = arg2;
    }

    let inputFileName;
    let outputFileName;
    let options = { };
    let arg;
    let express;
    let wrapMode;
    let index;

    for (index = 2; index < argv.length; ++index)
    {
        arg = argv[index];
        if (/^--/.test(arg))
        {
            const flag = arg.slice(2);
            switch (flag)
            {
            case 'diagnostic':
                options.perfInfo = { };
                break;
            case 'features':
                parseFeatures();
                break;
            case 'help':
            case 'version':
                return flag;
            case 'run-as':
            case 'wrap-with':
                parseRunAs();
                break;
            case 'trim-code':
                options.trimCode = true;
                break;
            default:
                throw Error(`unrecognized option ${quote(arg)}`);
            }
        }
        else if (/^-/.test(arg))
        {
            const flag = arg.slice(1);
            if (flag === 'f')
                parseFeatures();
            else if (flag === 'r')
                parseRunAs();
            else
                flag.split('').forEach(parseFlag);
        }
        else
        {
            if (outputFileName != null)
                throw Error(`unexpected argument ${quote(arg)}`);
            if (inputFileName != null)
                outputFileName = arg;
            else
                inputFileName = arg;
        }
    }
    if (!options.runAs)
    {
        const runAs = (express ? ['express'] : []).concat(wrapMode || []).join('-');
        if (runAs)
            options.runAs = runAs;
    }
    const result = { inputFileName, outputFileName, options };
    return result;
}

function quote(arg)
{
    return `"${arg}"`;
}

function widthOf(size)
{
    return String(size).length;
}

module.exports = { createDiagnosticReport, createReport, parseCommandLine };
