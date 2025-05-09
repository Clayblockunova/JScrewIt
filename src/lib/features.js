/* global Audio, Iterator, Node, console, document, history, location, navigator, self, statusbar */

import { _Object_defineProperty, _Object_keys, assignNoEnum, createEmpty }  from './obj-utils';
import { createFeatureClass, featuresToMask }                               from '~feature-hub';

var ELEMENTARY;
var Feature;

function checkLocaleNumeral(locale, number, regExp)
{
    var localizedNumeral = number.toLocaleString(locale);
    var returnValue = regExp.test(localizedNumeral);
    return returnValue;
}

function describeEngine(engine)
{
    var description = 'Features available in ' + engine + '.';
    return description;
}

function isExcludingAttribute(restrictionCache, restrictionName, featureObjs)
{
    var returnValue = restrictionCache[restrictionName];
    if (returnValue === undefined)
    {
        restrictionCache[restrictionName] =
        returnValue =
        featureObjs.some
        (
            function (featureObj)
            {
                var returnValue = restrictionName in featureObj.attributes;
                return returnValue;
            }
        );
    }
    return returnValue;
}

function makeSelfFeatureCheck(regExp)
{
    function check()
    {
        // self + '' throws an error inside a web worker in Safari 8 and 9.
        try
        {
            var str = self + '';
        }
        catch (error)
        {
            return false;
        }
        var available = regExp.test(str);
        return available;
    }

    return check;
}

function restrict(environment, engineFeatureObjs)
{
    var restrictionCache = createEmpty();
    var elementaryFeatureObjs =
    ELEMENTARY.filter
    (
        function (elementaryFeatureObj)
        {
            var included = this.includes(elementaryFeatureObj);
            if (included)
            {
                var attributes = elementaryFeatureObj.attributes;
                included =
                !(
                    environment in attributes &&
                    (
                        engineFeatureObjs === undefined ||
                        isExcludingAttribute
                        (restrictionCache, attributes[environment], engineFeatureObjs)
                    )
                );
            }
            return included;
        },
        this
    );
    var restrictedFeatureObj = Feature(elementaryFeatureObjs);
    return restrictedFeatureObj;
}

var featureInfos =
{
    ANY_DOCUMENT:
    {
        description:
        'Existence of the global object document whose string representation starts with ' +
        '"[object " and ends with "Document]".',
        check:
        function ()
        {
            var available =
            typeof document === 'object' && /^\[object [\S\s]*Document]$/.test(document + '');
            return available;
        },
        attributes: { 'web-worker': 'web-worker-restriction' },
    },
    ANY_WINDOW:
    {
        description:
        'Existence of the global object self whose string representation starts with "[object " ' +
        'and ends with "Window]".',
        check:      makeSelfFeatureCheck(/^\[object [\S\s]*Window]$/),
        includes:   ['SELF_OBJ'],
        attributes: { 'web-worker': 'web-worker-restriction' },
    },
    ARRAY_ITERATOR:
    {
        description:
        'The property that the string representation of Array.prototype.entries() starts with ' +
        '"[object Array" and ends with "]" at index 21 or 22.',
        check:
        function ()
        {
            var available =
            Array.prototype.entries && /^\[object Array[\S\s]{8,9}]$/.test([].entries());
            return available;
        },
    },
    ASYNC_FUNCTION:
    {
        description: 'Support for async functions, which return Promise object.',
        check:
        function ()
        {
            try
            {
                Function('return async function(){}');
                return true;
            }
            catch (error)
            { }
        },
    },
    ARROW:
    {
        description: 'Support for arrow functions.',
        check:
        function ()
        {
            try
            {
                Function('()=>{}')();
                return true;
            }
            catch (error)
            { }
        },
    },
    AT:
    {
        description: 'Existence of the native function Array.prototype.at.',
        check:
        function ()
        {
            var available = Array.prototype.at;
            return available;
        },
    },
    ATOB:
    {
        description:    'Existence of the global functions atob and btoa.',
        check:
        function ()
        {
            var available = typeof atob === 'function' && typeof btoa === 'function';
            return available;
        },
        attributes:     { 'web-worker': 'old-safari-restriction' },
    },
    BARPROP:
    {
        description:
        'Existence of the global object statusbar having the string representation "[object ' +
        'BarProp]".',
        check:
        function ()
        {
            var available = typeof statusbar === 'object' && statusbar + '' === '[object BarProp]';
            return available;
        },
        attributes: { 'web-worker': 'web-worker-restriction' },
    },
    CALL_ON_GLOBAL:
    {
        description:
        'The ability to call a function on the global object when invoking ' +
        'Function.prototype.call without binding.',
        check:
        function ()
        {
            try
            {
                if ([].concat.call()[0])
                    return true;
            }
            catch (error)
            { }
        },
    },
    CAPITAL_HTML:
    {
        description:
        'The property that the various string methods returning HTML code such as ' +
        'String.prototype.big or String.prototype.link have both the tag name and attributes ' +
        'written in capital letters.',
        check:
        function ()
        {
            var available =
            ''.big()            === '<BIG></BIG>'               &&
            ''.fontcolor('')    === '<FONT COLOR=""></FONT>'    &&
            ''.fontsize('')     === '<FONT SIZE=""></FONT>'     &&
            ''.link('')         === '<A HREF=""></A>'           &&
            ''.small()          === '<SMALL></SMALL>'           &&
            ''.strike()         === '<STRIKE></STRIKE>'         &&
            ''.sub()            === '<SUB></SUB>'               &&
            ''.sup()            === '<SUP></SUP>';
            return available;
        },
    },
    CONSOLE:
    {
        description:
        'Existence of the global object console having the string representation "[object ' +
        'Console]".\n' +
        'This feature may become unavailable when certain browser extensions are active.',
        check:
        function ()
        {
            var available = typeof console === 'object' && console + '' === '[object Console]';
            return available;
        },
        attributes: { 'web-worker': 'no-console-in-web-worker' },
    },
    CREATE_ELEMENT:
    {
        description:    'Existence of the function document.createElement.',
        aliasFor:       'ANY_DOCUMENT',
    },
    DOCUMENT:
    {
        description:
        'Existence of the global object document having the string representation "[object ' +
        'Document]".',
        check:
        function ()
        {
            var available = typeof document === 'object' && document + '' === '[object Document]';
            return available;
        },
        includes:   ['ANY_DOCUMENT'],
        attributes: { 'web-worker': 'web-worker-restriction' },
    },
    DOMWINDOW:
    {
        description:
        'Existence of the global object self having the string representation "[object ' +
        'DOMWindow]".',
        check:      makeSelfFeatureCheck(/^\[object DOMWindow]$/),
        includes:   ['ANY_WINDOW'],
        excludes:   ['OBJECT_W_SELF'],
        attributes: { 'web-worker': 'web-worker-restriction' },
    },
    ESC_HTML_ALL:
    {
        description:
        'The property that double quotation mark, less than and greater than characters in the ' +
        'argument of String.prototype.fontcolor are escaped into their respective HTML entities.',
        check:
        function ()
        {
            var available = ~''.fontcolor('"<>').indexOf('&quot;&lt;&gt;');
            return available;
        },
        includes: ['ESC_HTML_QUOT'],
        excludes: ['ESC_HTML_QUOT_ONLY'],
    },
    ESC_HTML_QUOT:
    {
        description:
        'The property that double quotation marks in the argument of String.prototype.fontcolor ' +
        'are escaped as "&quot;".',
        check:
        function ()
        {
            var available = ~''.fontcolor('"').indexOf('&quot;');
            return available;
        },
    },
    ESC_HTML_QUOT_ONLY:
    {
        description:
        'The property that only double quotation marks and no other characters in the argument ' +
        'of String.prototype.fontcolor are escaped into HTML entities.',
        check:
        function ()
        {
            var available = ~''.fontcolor('"<>').indexOf('&quot;<>');
            return available;
        },
        includes: ['ESC_HTML_QUOT'],
        excludes: ['ESC_HTML_ALL'],
    },
    ESC_REGEXP_LF:
    {
        description:
        'Having regular expressions created with the RegExp constructor use escape sequences ' +
        'starting with a backslash to format line feed characters ("\\n") in their string ' +
        'representation.',
        check:
        function ()
        {
            var available = (RegExp('\n') + '')[1] === '\\';
            return available;
        },
    },
    ESC_REGEXP_SLASH:
    {
        description:
        'Having regular expressions created with the RegExp constructor use escape sequences ' +
        'starting with a backslash to format slashes ("/") in their string representation.',
        check:
        function ()
        {
            var available = (RegExp('/') + '')[1] === '\\';
            return available;
        },
    },
    FF_SRC:
    {
        description:
        'A string representation of native functions typical for Firefox and Safari.\n' +
        'Remarkable traits are the lack of line feed characters at the beginning and at the end ' +
        'of the string and the presence of a line feed followed by four whitespaces ("\\n    ") ' +
        'before the "[native code]" sequence.',
        includes: ['NO_IE_SRC', 'NO_V8_SRC'],
        excludes: ['NO_FF_SRC'],
    },
    FILL:
    {
        description: 'Existence of the native function Array.prototype.fill.',
        check:
        function ()
        {
            var available = Array.prototype.fill;
            return available;
        },
    },
    FLAT:
    {
        description: 'Existence of the native function Array.prototype.flat.',
        check:
        function ()
        {
            var available = Array.prototype.flat;
            return available;
        },
    },
    FORMS:
    {
        description:
        'Existence of the object document.forms with string representation "[object ' +
        'HTMLCollection]".',
        aliasFor: 'ANY_DOCUMENT',
    },
    FROM_CODE_POINT:
    {
        description: 'Existence of the function String.fromCodePoint.',
        check:
        function ()
        {
            var available = String.fromCodePoint;
            return available;
        },
    },
    FUNCTION_19_LF:
    {
        description:
        'A string representation of dynamically generated functions where the character at index ' +
        '19 is a line feed ("\\n").',
        check:
        function ()
        {
            var available = (Function() + '')[19] === '\n';
            return available;
        },
    },
    FUNCTION_22_LF:
    {
        description:
        'A string representation of dynamically generated functions where the character at index ' +
        '22 is a line feed ("\\n").',
        check:
        function ()
        {
            var available = (Function() + '')[22] === '\n';
            return available;
        },
    },
    GENERIC_ARRAY_TO_STRING:
    {
        description: 'Ability to call Array.prototype.toString with a non-array binding.',
        check:
        function ()
        {
            try
            {
                Array.prototype.toString.call({ });
                return true;
            }
            catch (error)
            { }
        },
    },
    GLOBAL_UNDEFINED:
    {
        description:
        'Having the global function toString return the string "[object Undefined]" when invoked ' +
        'without a binding.',
        check:
        function ()
        {
            var getToString = Function('return toString');
            var available = getToString()() === '[object Undefined]';
            return available;
        },
        includes: ['OBJECT_UNDEFINED'],
    },
    GMT:
    {
        description:
        'Presence of the text "GMT" after the first 25 characters in the string returned by ' +
        'Date().\n' +
        'The string representation of dates is implementation dependent, but most engines use a ' +
        'similar format, making this feature available in all supported engines except Internet ' +
        'Explorer 9 and 10.',
        check:
        function ()
        {
            var available = /^.{25}GMT/.test(Date());
            return available;
        },
    },
    HISTORY:
    {
        description:
        'Existence of the global object history having the string representation "[object ' +
        'History]".',
        check:
        function ()
        {
            var available = typeof history === 'object' && history + '' === '[object History]';
            return available;
        },
        attributes: { 'web-worker': 'web-worker-restriction' },
    },
    HTMLAUDIOELEMENT:
    {
        description:
        'Existence of the global object Audio whose string representation starts with ' +
        '"function HTMLAudioElement".',
        check:
        function ()
        {
            var available =
            typeof Audio !== 'undefined' && /^function HTMLAudioElement/.test(Audio);
            return available;
        },
        includes:   ['NO_IE_SRC'],
        attributes: { 'web-worker': 'web-worker-restriction' },
    },
    IE_SRC:
    {
        description:
        'A string representation of native functions typical for Internet Explorer.\n' +
        'Remarkable traits are the presence of a line feed character ("\\n") at the beginning ' +
        'and at the end of the string and a line feed followed by four whitespaces ("\\n    ") ' +
        'before the "[native code]" sequence.',
        includes: ['NO_FF_SRC', 'NO_V8_SRC'],
        excludes: ['NO_IE_SRC'],
    },
    INCR_CHAR:
    {
        description:
        'The ability to use unary increment operators with string characters, like in ( ++"some ' +
        'string"[0] ): this will result in a TypeError in strict mode in ECMAScript compliant ' +
        'engines.',
        check:
        function ()
        {
            return true;
        },
        attributes: { 'forced-strict-mode': 'char-increment-restriction' },
    },
    INTL:
    {
        description: 'Existence of the global object Intl.',
        check:
        function ()
        {
            var available = typeof Intl === 'object';
            return available;
        },
    },
    ITERATOR_HELPER:
    {
        description: 'Availability of iterator helpers.',
        check:
        function ()
        {
            var available = typeof Iterator === 'function';
            return available;
        },
    },
    JAPANESE_INFINITY:
    {
        description: 'Japanese string representation of Infinity ending with "∞".',
        check:
        function ()
        {
            var available = /∞$/.test(Infinity.toLocaleString('ja'));
            return available;
        },
    },
    LOCALE_INFINITY:
    {
        description: 'Language sensitive string representation of Infinity as "∞".',
        check:
        function ()
        {
            var available = Infinity.toLocaleString() === '∞';
            return available;
        },
    },
    LOCALE_NUMERALS:
    {
        description:
        'Features shared by all engines capable of localized number formatting, including output ' +
        'of Arabic digits, the Arabic decimal separator "٫", the letters in the first word of ' +
        'the Arabic string representation of NaN ("ليس"), Persian digits and the Persian digit ' +
        'group separator "٬".',
        check:
        function ()
        {
            var available =
            checkLocaleNumeral('ar', NaN, /^ليس/) &&
            checkLocaleNumeral('ar-td', 234567890.1, /^٢٣٤٬?٥٦٧٬?٨٩٠٫١/) &&
            checkLocaleNumeral('fa', 1234567890, /^۱٬۲۳۴٬۵۶۷٬۸۹۰/);
            return available;
        },
    },
    LOCALE_NUMERALS_BN:
    {
        description: 'Localized number formatting for Bengali.',
        check:
        function ()
        {
            var available = checkLocaleNumeral('bn', 1234567890, /^১,২৩,৪৫,৬৭,৮৯০/);
            return available;
        },
    },
    LOCALE_NUMERALS_EXT:
    {
        description:
        'Extended localized number formatting.\n' +
        'This includes all features of LOCALE_NUMERALS plus the output of the first three ' +
        'letters in the second word of the Arabic string representation of NaN ("رقم"), the ' +
        'letters in the Russian string representation of NaN ("не\xa0число") and the letters in ' +
        'the Persian string representation of NaN ("ناعدد").',
        check:
        function ()
        {
            var available =
            checkLocaleNumeral('ar', NaN, /^ليس.رقم/) &&
            checkLocaleNumeral('ar-td', 234567890.1, /^٢٣٤٬?٥٦٧٬?٨٩٠٫١/) &&
            checkLocaleNumeral('fa', 1234567890, /^۱٬۲۳۴٬۵۶۷٬۸۹۰/) &&
            checkLocaleNumeral('fa', NaN, /^ناعد/) &&
            checkLocaleNumeral('ru', NaN, /^не.число/);
            return available;
        },
        includes:   ['LOCALE_NUMERALS'],
        attributes: { 'web-worker': 'locale-numerals-ext-restriction' },
    },
    LOCALE_NUMERALS_IE11_WIN7:
    {
        description:
        'Localized number formatting exclusive to Interner Explorer 11 in Windows 7.\n' +
        'This includes string representation of Infinity ("bezgalība") and string ' +
        'representation of Infinity ("бесконечность").',
        check:
        function ()
        {
            var available =
            checkLocaleNumeral('lv', Infinity, /^bezgalība/) &&
            checkLocaleNumeral('ru', Infinity, /^бесконечность/);
            return available;
        },
    },
    LOCALE_NUMERALS_IE11_WIN7_8:
    {
        description:
        'Localized number formatting exclusive to Interner Explorer 11 in Windows 7 and 8.\n' +
        'This includes all features of LOCALE_NUMERALS plus the output of the letters in the ' +
        'second word of the Arabic string representation of NaN ("برقم"), the letters in the ' +
        'Arabic string representation of Infinity ("+لا\xa0نهاية"), the letters in the the Czech ' +
        'string representation of NaN ("Není\xa0číslo"), the letters in the the Greek string ' +
        'representation of Infinity ("Άπειρο"), the letters in the Greek string representation ' +
        'of NaN ("μη\xa0αριθμός"), the letters in the Hebrew string representation of NaN ' +
        '("לא\xa0מספר"), the characters in the Japanese string representation of Infinity ' +
        '("+∞"), the characters in the Japanese string representation of NaN ("NaN\xa0(非数値)"), ' +
        'the letters in the Lithuanian string representation of Infinity ("begalybė"), the ' +
        'letters in the Polish string representation of Infinity ("+nieskończoność"), the ' +
        'characters in the Chinese string representation of Infinity ("正无穷大" or "正無窮大"), the ' +
        'characters in the Simplified Chinese string representation of NaN ("非数字").',
        check:
        function ()
        {
            var available =
            checkLocaleNumeral('ar', NaN, /^ليس.برقم/) &&
            checkLocaleNumeral('ar', Infinity, /^\+لا.نهاية/) &&
            checkLocaleNumeral('cs', NaN, /^Není.číslo/) &&
            checkLocaleNumeral('el', Infinity, /^Άπειρο/) &&
            checkLocaleNumeral('el', NaN, /^μη.αριθμός/) &&
            checkLocaleNumeral('he', NaN, /^לא.מספר/) &&
            checkLocaleNumeral('ja', Infinity, /^\+∞/) &&
            checkLocaleNumeral('ja', NaN, /^NaN.\(非数値\)/) &&
            checkLocaleNumeral('lt', Infinity, /^begalybė/) &&
            checkLocaleNumeral('pl', Infinity, /^\+nieskończoność/) &&
            checkLocaleNumeral('zh', Infinity, /^正/) &&
            checkLocaleNumeral('zh-cn', NaN, /^非数字/);
            return available;
        },
    },
    LOCALE_NUMERALS_IE11_WIN8:
    {
        description:
        'Localized number formatting exclusive to Interner Explorer 11 in Windows 8.\n' +
        'In this case, Latvian and Russian string representation of Infinity are both "∞".',
        check:
        function ()
        {
            var available = Infinity.toLocaleString('lv') === '∞' &&
            Infinity.toLocaleString('ru') === '∞';
            return available;
        },
    },
    LOCATION:
    {
        description:
        'Existence of the global object location with the property that ' +
        'Object.prototype.toString.call(location) evaluates to a string that starts with ' +
        '"[object " and ends with "Location]".',
        check:
        function ()
        {
            var available =
            typeof location === 'object' &&
            /^\[object [\S\s]*Location]$/.test(Object.prototype.toString.call(location));
            return available;
        },
    },
    MOZILLA:
    {
        description:
        'Existence of user agent string navigator.userAgent that starts with "Mozilla".',
        check:
        function ()
        {
            var available =
            typeof navigator === 'object' && /^Mozilla/.test(navigator.userAgent);
            return available;
        },
    },
    NAME:
    {
        description: 'Existence of the name property for functions.',
        check:
        function ()
        {
            var available = 'name' in Function();
            return available;
        },
    },
    NODECONSTRUCTOR:
    {
        description:
        'Existence of the global object Node having the string representation "[object ' +
        'NodeConstructor]".',
        check:
        function ()
        {
            var available = typeof Node !== 'undefined' && Node + '' === '[object NodeConstructor]';
            return available;
        },
        attributes: { 'web-worker': 'web-worker-restriction' },
    },
    NODE_NAME:
    {
        description:
        'Existence of the string document.nodeName that starts with a number sign ("#").',
        aliasFor: 'ANY_DOCUMENT',
    },
    NO_FF_SRC:
    {
        description:
        'A string representation of native functions typical for V8 or for Internet Explorer but ' +
        'not for Firefox and Safari.',
        check:
        function ()
        {
            var available = /^(\n?)function Object\(\) \{\1 +\[native code]\s\}/.test(Object);
            return available;
        },
        excludes: ['FF_SRC'],
    },
    NO_IE_SRC:
    {
        description:
        'A string representation of native functions typical for most engines with the notable ' +
        'exception of Internet Explorer.\n' +
        'A remarkable trait of this feature is the lack of line feed characters at the beginning ' +
        'and at the end of the string.',
        check:
        function ()
        {
            var available = /^function Object\(\) \{(\n   )? \[native code]\s\}/.test(Object);
            return available;
        },
        excludes: ['IE_SRC'],
    },
    NO_OLD_SAFARI_ARRAY_ITERATOR:
    {
        description:
        'The property that the string representation of Array.prototype.entries() evaluates to ' +
        '"[object Array Iterator]".',
        check:
        function ()
        {
            if (Array.prototype.entries)
            {
                var available = [].entries() + '' === '[object Array Iterator]';
                return available;
            }
        },
        includes: ['ARRAY_ITERATOR'],
    },
    NO_V8_SRC:
    {
        description:
        'A string representation of native functions typical for Firefox, Internet Explorer and ' +
        'Safari.\n' +
        'A most remarkable trait of this feature is the presence of a line feed followed by four ' +
        'whitespaces ("\\n    ") before the "[native code]" sequence.',
        check:
        function ()
        {
            var available = /^\n?function Object\(\) \{\n    \[native code]\s\}/.test(Object);
            return available;
        },
        excludes: ['V8_SRC'],
    },
    OBJECT_ARRAY_ENTRIES_CTOR:
    {
        description:
        'The property that the Array.prototype.entries().constructor is the Object constructor.',
        check:
        function ()
        {
            var available = Array.prototype.entries && [].entries().constructor === Object;
            return available;
        },
    },
    OBJECT_L_LOCATION_CTOR:
    {
        description:
        'Existence of the global function location.constructor whose string representation ' +
        'starts with "[object L".',
        check:
        function ()
        {
            var available =
            typeof location === 'object' && /^\[object L/.test(location.constructor);
            return available;
        },
        attributes: { 'web-worker': 'web-worker-restriction' },
    },
    OBJECT_UNDEFINED:
    {
        description:
        'Having the function Object.prototype.toString return the string "[object Undefined]" ' +
        'when invoked without a binding.',
        check:
        function ()
        {
            var toString = Object.prototype.toString;
            var available = toString() === '[object Undefined]';
            return available;
        },
        includes: ['UNDEFINED'],
    },
    OBJECT_W_SELF:
    {
        description:
        'The property that the string representation of the global object self starts ' +
        'with "[object W".',
        check:      makeSelfFeatureCheck(/^\[object W/),
        includes:   ['SELF_OBJ'],
        excludes:   ['DOMWINDOW'],
        attributes: { 'web-worker': 'non-ie-restriction' },
    },
    OLD_SAFARI_LOCATION_CTOR:
    {
        description:
        'Existence of the global object location.constructor whose string representation starts ' +
        'with "[object " and ends with "LocationConstructor]".',
        check:
        function ()
        {
            var available =
            typeof location === 'object' &&
            /^\[object [\S\s]*LocationConstructor]$/.test(location.constructor);
            return available;
        },
    },
    PLAIN_INTL:
    {
        description:
        'Existence of the global object Intl having the string representation "[object Object]".',
        check:
        function ()
        {
            var available = typeof Intl === 'object' && Intl + '' === '[object Object]';
            return available;
        },
        includes: ['INTL'],
    },
    REGEXP_STRING_ITERATOR:
    {
        description:
        'The property that the string representation of String.prototype.matchAll() evaluates to ' +
        '"[object RegExp String Iterator]".',
        check:
        function ()
        {
            var available =
            String.prototype.matchAll && ''.matchAll() + '' === '[object RegExp String Iterator]';
            return available;
        },
    },
    SELF:
    { aliasFor: 'ANY_WINDOW' },
    SELF_OBJ:
    {
        description:
        'Existence of the global object self whose string representation starts with "[object ".',
        check:      makeSelfFeatureCheck(/^\[object /),
        attributes: { 'web-worker': 'safari-bug-21820506' },
    },
    SHORT_LOCALES:
    {
        description:
        'Support for the two-letter locale name "ar" to format decimal numbers as Arabic numerals.',
        check:
        function ()
        {
            var NUMBER = 9876430.125;

            var localizedNumeral = NUMBER.toLocaleString('ar');
            var available =
            localizedNumeral === NUMBER.toLocaleString('ar-td') &&
            localizedNumeral !== NUMBER.toLocaleString('en');
            return available;
        },
        includes: ['LOCALE_NUMERALS'],
    },
    STATUS:
    {
        description:    'Existence of the global string status.',
        check:
        function ()
        {
            var available = typeof status === 'string';
            return available;
        },
        attributes:     { 'web-worker': 'web-worker-restriction' },
    },
    UNDEFINED:
    {
        description:
        'The property that Object.prototype.toString.call() evaluates to "[object Undefined]".\n' +
        'This behavior is specified by ECMAScript, and is enforced by all engines except Android ' +
        'Browser versions prior to 4.1.2, where this feature is not available.',
        check:
        function ()
        {
            var available = Object.prototype.toString.call() === '[object Undefined]';
            return available;
        },
    },
    V8_SRC:
    {
        description:
        'A string representation of native functions typical for the V8 engine.\n' +
        'Remarkable traits are the lack of line feed characters at the beginning and at the end ' +
        'of the string and the presence of a single whitespace before the "[native code]" ' +
        'sequence.',
        includes: ['NO_FF_SRC', 'NO_IE_SRC'],
        excludes: ['NO_V8_SRC'],
    },
    WINDOW:
    {
        description:
        'Existence of the global object self having the string representation "[object Window]".',
        check:      makeSelfFeatureCheck(/^\[object Window]$/),
        includes:   ['ANY_WINDOW', 'OBJECT_W_SELF'],
        attributes: { 'web-worker': 'web-worker-restriction' },
    },

    DEFAULT:
    {
        description:
        'Minimum feature level, compatible with all supported engines in all environments.',
    },
    BROWSER:
    {
        description:
        'Features available in all browsers.\n' +
        'No support for Node.js.',
        includes: ['ANY_DOCUMENT', 'ANY_WINDOW', 'HISTORY', 'INCR_CHAR', 'MOZILLA', 'STATUS'],
        attributes:
        {
            'char-increment-restriction':   null,
            'safari-bug-21820506':          null,
            'web-worker-restriction':       null,
        },
    },
    COMPACT:
    {
        description:
        'All new browsers\' features.\n' +
        'No support for Node.js and older browsers like Internet Explorer, Safari 17.3 or ' +
        'Android Browser.',
        includes:
        [
            'ANY_DOCUMENT',
            'ARROW',
            'ASYNC_FUNCTION',
            'AT',
            'ATOB',
            'BARPROP',
            'ESC_HTML_QUOT_ONLY',
            'ESC_REGEXP_LF',
            'ESC_REGEXP_SLASH',
            'FILL',
            'FLAT',
            'FROM_CODE_POINT',
            'FUNCTION_19_LF',
            'GENERIC_ARRAY_TO_STRING',
            'GLOBAL_UNDEFINED',
            'GMT',
            'HISTORY',
            'INCR_CHAR',
            'INTL',
            'ITERATOR_HELPER',
            'JAPANESE_INFINITY',
            'LOCALE_INFINITY',
            'LOCALE_NUMERALS_EXT',
            'LOCATION',
            'MOZILLA',
            'NAME',
            'NO_IE_SRC',
            'NO_OLD_SAFARI_ARRAY_ITERATOR',
            'REGEXP_STRING_ITERATOR',
            'STATUS',
            'WINDOW',
        ],
        attributes:
        {
            'char-increment-restriction':       null,
            'locale-numerals-ext-restriction':  null,
            'non-ie-restriction':               null,
            'web-worker-restriction':           null,
        },
    },
    ANDRO_4_0:
    {
        families: ['Android Browser'],
        versions: ['4.0'],
        includes:
        [
            'ANY_DOCUMENT',
            'ATOB',
            'CALL_ON_GLOBAL',
            'CONSOLE',
            'DOMWINDOW',
            'ESC_HTML_ALL',
            'FUNCTION_22_LF',
            'GMT',
            'HISTORY',
            'INCR_CHAR',
            'LOCATION',
            'MOZILLA',
            'NAME',
            'STATUS',
            'V8_SRC',
        ],
    },
    ANDRO_4_1:
    {
        inherits: 'ANDRO_4_0',
        versions: ['4.1-4.3'],
        includes: { CALL_ON_GLOBAL: false, GENERIC_ARRAY_TO_STRING: true, OBJECT_UNDEFINED: true },
    },
    ANDRO_4_4:
    {
        inherits:   'ANDRO_4_1',
        versions:   ['4.4'],
        includes:
        {
            BARPROP:                true,
            DOMWINDOW:              false,
            HTMLAUDIOELEMENT:       true,
            JAPANESE_INFINITY:      true,
            LOCALE_INFINITY:        true,
            LOCALE_NUMERALS_BN:     true,
            LOCALE_NUMERALS_EXT:    true,
            PLAIN_INTL:             true,
            SHORT_LOCALES:          true,
            WINDOW:                 true,
        },
        attributes:
        {
            'no-console-in-web-worker': null,
            'non-ie-restriction':       null,
            'web-worker-restriction':   null,
        },
    },
    CHROME_PREV:
    {
        description:    describeEngine('the previous to current versions of Chrome and Edge'),
        aliasFor:       'CHROME_122',
    },
    CHROME:
    {
        description:    describeEngine('the current stable versions of Chrome, Edge and Opera'),
        aliasFor:       'CHROME_122',
    },
    CHROME_122:
    {
        families: ['Chrome', 'Edge', 'Opera'],
        versions: ['122-', '122-', '108-'],
        includes:
        [
            'ANY_DOCUMENT',
            'ARROW',
            'ASYNC_FUNCTION',
            'AT',
            'ATOB',
            'BARPROP',
            'ESC_HTML_QUOT_ONLY',
            'ESC_REGEXP_LF',
            'ESC_REGEXP_SLASH',
            'FILL',
            'FLAT',
            'FROM_CODE_POINT',
            'FUNCTION_19_LF',
            'GENERIC_ARRAY_TO_STRING',
            'GLOBAL_UNDEFINED',
            'GMT',
            'HISTORY',
            'INCR_CHAR',
            'INTL',
            'ITERATOR_HELPER',
            'JAPANESE_INFINITY',
            'LOCALE_INFINITY',
            'LOCALE_NUMERALS_BN',
            'LOCALE_NUMERALS_EXT',
            'LOCATION',
            'MOZILLA',
            'NAME',
            'NO_OLD_SAFARI_ARRAY_ITERATOR',
            'REGEXP_STRING_ITERATOR',
            'STATUS',
            'V8_SRC',
            'WINDOW',
        ],
        attributes:
        {
            'char-increment-restriction':   null,
            'non-ie-restriction':           null,
            'unstable':                     null,
            'web-worker-restriction':       null,
        },
    },
    FF_ESR:
    {
        description:    describeEngine('the current version of Firefox ESR'),
        aliasFor:       'FF_90',
    },
    FF_PREV:
    {
        description:    describeEngine('the previous to current version of Firefox'),
        aliasFor:       'FF_134',
    },
    FF:
    {
        description:    describeEngine('the current stable version of Firefox'),
        aliasFor:       'FF_134',
    },
    FF_90:
    {
        families: ['Firefox'],
        versions: ['90-130'],
        includes:
        [
            'ANY_DOCUMENT',
            'ARROW',
            'ASYNC_FUNCTION',
            'AT',
            'ATOB',
            'BARPROP',
            'ESC_HTML_QUOT_ONLY',
            'ESC_REGEXP_LF',
            'ESC_REGEXP_SLASH',
            'FF_SRC',
            'FILL',
            'FLAT',
            'FROM_CODE_POINT',
            'FUNCTION_19_LF',
            'GENERIC_ARRAY_TO_STRING',
            'GLOBAL_UNDEFINED',
            'GMT',
            'HISTORY',
            'INCR_CHAR',
            'INTL',
            'JAPANESE_INFINITY',
            'LOCALE_INFINITY',
            'LOCALE_NUMERALS_BN',
            'LOCALE_NUMERALS_EXT',
            'LOCATION',
            'MOZILLA',
            'NAME',
            'NO_OLD_SAFARI_ARRAY_ITERATOR',
            'OBJECT_ARRAY_ENTRIES_CTOR',
            'REGEXP_STRING_ITERATOR',
            'SHORT_LOCALES',
            'STATUS',
            'WINDOW',
        ],
        attributes:
        {
            'char-increment-restriction':   null,
            'non-ie-restriction':           null,
            'unstable':                     null,
            'web-worker-restriction':       null,
        },
    },
    FF_131:
    {
        inherits:   'FF_90',
        versions:   ['131-133'],
        includes:   { ITERATOR_HELPER: true, OBJECT_ARRAY_ENTRIES_CTOR: false },
    },
    FF_134:
    {
        inherits:   'FF_131',
        versions:   ['134-'],
        includes:   { SHORT_LOCALES: false },
    },
    IE_9:
    {
        families: ['Internet Explorer'],
        versions: ['9'],
        includes:
        [
            'CAPITAL_HTML',
            'DOCUMENT',
            'ESC_REGEXP_LF',
            'ESC_REGEXP_SLASH',
            'FUNCTION_22_LF',
            'GENERIC_ARRAY_TO_STRING',
            'HISTORY',
            'IE_SRC',
            'INCR_CHAR',
            'MOZILLA',
            'OBJECT_L_LOCATION_CTOR',
            'STATUS',
            'UNDEFINED',
            'WINDOW',
        ],
    },
    IE_10:
    {
        inherits:   'IE_9',
        versions:   ['10'],
        includes:   { ATOB: true, CONSOLE: true, OBJECT_UNDEFINED: true, UNDEFINED: false },
        attributes: { 'char-increment-restriction': null, 'web-worker-restriction': null },
    },
    IE_11:
    {
        inherits: 'IE_10',
        versions: ['11'],
        includes:
        {
            ANY_DOCUMENT:                true,
            DOCUMENT:                    false,
            GMT:                         true,
            JAPANESE_INFINITY:           true,
            LOCALE_NUMERALS:             true,
            LOCALE_NUMERALS_IE11_WIN7:   true,
            LOCALE_NUMERALS_IE11_WIN7_8: true,
            PLAIN_INTL:                  true,
            SHORT_LOCALES:               true,
        },
    },
    IE_11_WIN_8:
    {
        inherits:               'IE_11',
        versions:               ['11'],
        compatibilityTag:       'on Windows 8',
        compatibilityShortTag:  'W8',
        includes:
        { LOCALE_NUMERALS_IE11_WIN7: false, LOCALE_NUMERALS_IE11_WIN8: true },
    },
    IE_11_WIN_10:
    {
        inherits:               'IE_11_WIN_8',
        versions:               ['11'],
        compatibilityTag:       'on Windows 10',
        compatibilityShortTag:  'W10',
        includes:
        {
            LOCALE_INFINITY:             true,
            LOCALE_NUMERALS_BN:          true,
            LOCALE_NUMERALS_EXT:         true,
            LOCALE_NUMERALS_IE11_WIN7_8: false,
            LOCALE_NUMERALS_IE11_WIN8:   false,
        },
    },
    NODE_0_10:
    {
        families: ['Node.js'],
        versions: ['0.10'],
        includes:
        [
            'ESC_HTML_ALL',
            'FUNCTION_22_LF',
            'GENERIC_ARRAY_TO_STRING',
            'GLOBAL_UNDEFINED',
            'GMT',
            'INCR_CHAR',
            'NAME',
            'V8_SRC',
        ],
    },
    NODE_0_12:
    {
        inherits: 'NODE_0_10',
        versions: ['0.12'],
        includes:
        {
            ESC_HTML_ALL:                   false,
            ESC_HTML_QUOT_ONLY:             true,
            JAPANESE_INFINITY:              true,
            LOCALE_INFINITY:                true,
            NO_OLD_SAFARI_ARRAY_ITERATOR:   true,
            OBJECT_ARRAY_ENTRIES_CTOR:      true,
            PLAIN_INTL:                     true,
        },
    },
    NODE_4:
    {
        inherits: 'NODE_0_12',
        versions: ['4'],
        includes: { ARROW: true, ESC_REGEXP_SLASH: true, FILL: true, FROM_CODE_POINT: true },
    },
    NODE_5:
    {
        inherits:   'NODE_4',
        versions:   ['5-7.5'],
        attributes: { 'char-increment-restriction': null },
    },
    NODE_7_6:
    {
        inherits: 'NODE_5',
        versions: ['7.6-9'],
        includes: { ASYNC_FUNCTION: true },
    },
    NODE_10:
    {
        inherits: 'NODE_7_6',
        versions: ['10'],
        includes: { FUNCTION_19_LF: true, FUNCTION_22_LF: false },
    },
    NODE_11:
    {
        inherits: 'NODE_10',
        versions: ['11'],
        includes: { FLAT: true },
    },
    NODE_12:
    {
        inherits: 'NODE_11',
        versions: ['12'],
        includes: { ESC_REGEXP_LF: true, REGEXP_STRING_ITERATOR: true },
    },
    NODE_13:
    {
        inherits: 'NODE_12',
        versions: ['13|14'],
        includes: { LOCALE_NUMERALS_BN: true, LOCALE_NUMERALS_EXT: true, SHORT_LOCALES: true },
    },
    NODE_15:
    {
        inherits: 'NODE_13',
        versions: ['15'],
        includes: { INTL: true, PLAIN_INTL: false },
    },
    NODE_16_0:
    {
        inherits: 'NODE_15',
        versions: ['16.0-16.5'],
        includes: { ATOB: true },
    },
    NODE_16_6:
    {
        inherits: 'NODE_16_0',
        versions: ['16.6-21'],
        includes: { AT: true },
    },
    NODE_22:
    {
        inherits: 'NODE_16_6',
        versions: ['22.0-22.11|23.0-23.2'],
        includes: { ITERATOR_HELPER: true, OBJECT_ARRAY_ENTRIES_CTOR: false },
    },
    NODE_22_12:
    {
        inherits: 'NODE_22',
        versions: ['22.12-22.14|23.3-'],
        includes: { SHORT_LOCALES: false },
    },
    SAFARI_7_0:
    {
        families: ['Safari'],
        versions: ['7.0'],
        includes:
        [
            'ANY_DOCUMENT',
            'ATOB',
            'BARPROP',
            'CONSOLE',
            'ESC_HTML_QUOT_ONLY',
            'ESC_REGEXP_LF',
            'ESC_REGEXP_SLASH',
            'FF_SRC',
            'GENERIC_ARRAY_TO_STRING',
            'GLOBAL_UNDEFINED',
            'GMT',
            'HISTORY',
            'INCR_CHAR',
            'LOCATION',
            'MOZILLA',
            'NAME',
            'NODECONSTRUCTOR',
            'OBJECT_L_LOCATION_CTOR',
            'OLD_SAFARI_LOCATION_CTOR',
            'STATUS',
            'WINDOW',
        ],
        attributes:
        {
            'char-increment-restriction':   null,
            'no-console-in-web-worker':     null,
            'non-ie-restriction':           null,
            'old-safari-restriction':       null,
            'web-worker-restriction':       null,
        },
    },
    SAFARI_7_1:
    {
        inherits:   'SAFARI_7_0',
        versions:   ['7.1|8'],
        includes:   { ARRAY_ITERATOR: true, FILL: true },
        attributes: { 'no-console-in-web-worker': undefined, 'safari-bug-21820506': null },
    },
    SAFARI_9:
    {
        inherits: 'SAFARI_7_1',
        versions: ['9'],
        includes:
        {
            ARRAY_ITERATOR:                 false,
            FROM_CODE_POINT:                true,
            FUNCTION_22_LF:                 true,
            NO_OLD_SAFARI_ARRAY_ITERATOR:   true,
            OBJECT_ARRAY_ENTRIES_CTOR:      true,
        },
    },
    SAFARI_10_0:
    {
        inherits:   'SAFARI_9',
        versions:   ['10.0'],
        includes:
        {
            ARROW:                      true,
            JAPANESE_INFINITY:          true,
            LOCALE_INFINITY:            true,
            LOCALE_NUMERALS_BN:         true,
            LOCALE_NUMERALS_EXT:        true,
            NODECONSTRUCTOR:            false,
            OBJECT_L_LOCATION_CTOR:     false,
            OLD_SAFARI_LOCATION_CTOR:   false,
            PLAIN_INTL:                 true,
            SHORT_LOCALES:              true,
        },
        attributes: { 'old-safari-restriction': undefined, 'safari-bug-21820506': undefined },
    },
    SAFARI_10_1:
    {
        inherits: 'SAFARI_10_0',
        versions: ['10.1|11'],
        includes: { ASYNC_FUNCTION: true },
    },
    SAFARI_12:
    {
        inherits: 'SAFARI_10_1',
        versions: ['12'],
        includes: { FLAT: true },
    },
    SAFARI_13:
    {
        inherits: 'SAFARI_12',
        versions: ['13|14.0.0'],
        includes: { REGEXP_STRING_ITERATOR: true },
    },
    SAFARI_14_0_1:
    {
        inherits: 'SAFARI_13',
        versions: ['14.0.1-14.0.3'],
        includes: { INTL: true, PLAIN_INTL: false },
    },
    SAFARI_14_1:
    {
        inherits: 'SAFARI_14_0_1',
        versions: ['14.1-15.3'],
        includes: { CONSOLE: false },
    },
    SAFARI_15_4:
    {
        inherits: 'SAFARI_14_1',
        versions: ['15.4-17.3'],
        includes: { AT: true },
    },
    SAFARI_17_4:
    {
        inherits: 'SAFARI_15_4',
        versions: ['17.4-17.6'],
        includes: { FUNCTION_19_LF: true, FUNCTION_22_LF: false },
    },
    SAFARI_18_0:
    {
        inherits: 'SAFARI_17_4',
        versions: ['18.0-18.3'],
        includes: { SHORT_LOCALES: false },
    },
    SAFARI:
    {
        description:    describeEngine('the current stable version of Safari'),
        aliasFor:       'SAFARI_18_4',
    },
    SAFARI_18_4:
    {
        inherits:   'SAFARI_18_0',
        versions:   ['18.4-'],
        includes:
        { ITERATOR_HELPER: true, LOCALE_NUMERALS_BN: false, OBJECT_ARRAY_ENTRIES_CTOR: false },
        attributes: { 'locale-numerals-ext-restriction': null },
    },
};
(function ()
{
    function formatEngineDescription(compatibilities)
    {
        var appendix = '';
        var parts =
        compatibilities.map
        (
            function (compatibility)
            {
                var family = compatibility.family;
                var versions = compatibility.versions;
                var part =
                versions.map
                (
                    function (version)
                    {
                        var versionText;
                        if (typeof version === 'string')
                            versionText = version;
                        else
                        {
                            var from    = version.from;
                            var to      = version.to;
                            if (to != null)
                                versionText = from + ' to ' + to;
                            else
                            {
                                versionText = from;
                                appendix = ' or later';
                            }
                        }
                        return family + ' ' + versionText;
                    }
                )
                .join(' and ');
                var tag = compatibility.tag;
                if (tag != null)
                    part += ' ' + tag;
                return part;
            }
        );
        var lastPart = parts.pop();
        var engine = (parts.length ? parts.join(', ') + ' and ' + lastPart : lastPart) + appendix;
        var description = describeEngine(engine);
        return description;
    }

    var autoIncludes =
    _Object_keys(featureInfos).filter
    (
        function (featureName)
        {
            var featureInfo = featureInfos[featureName];
            var check = featureInfo.check;
            var returnValue = check && check();
            return returnValue;
        }
    );
    featureInfos.AUTO =
    {
        description:    describeEngine('the current environment'),
        includes:       autoIncludes,
    };
    Feature = createFeatureClass(featureInfos, formatEngineDescription);
    ELEMENTARY = Feature.ELEMENTARY;
    featureInfos = null;
    assignNoEnum(Feature.prototype, { restrict: restrict });
    var ALL = Feature.ALL;
    var descriptor = { enumerable: true };
    for (var featureName in ALL)
    {
        var featureObj = ALL[featureName];
        descriptor.value = featureObj;
        _Object_defineProperty(Feature, featureName, descriptor);
    }
}
)();

export { Feature, featuresToMask };
