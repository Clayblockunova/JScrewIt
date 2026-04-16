import { SCREW_AS_BONDED_STRING, SCREW_AS_STRING, SCREW_NORMAL }    from '../screw-buffer';
import { replaceStaticString }                                      from './encoder-utils';

/**
 * An object that exposes properties used to split a string into an array of strings or to join
 * array elements into a string.
 *
 * @typedef Delimiter
 *
 * @property {string} separator
 * An express-parsable expression used as an argument for `String.prototype.split` to split a string
 * into an array of strings.
 *
 * @property {string} joiner
 * The joiner can be any string. A joiner is inserted between adjacent strings in an array in order
 * to join them into a single string.
 */

function replaceJoinedArrayString(array, joiner, maxLength)
{
    var str = array.join(joiner);
    var options = { maxLength: maxLength, screwMode: SCREW_AS_BONDED_STRING };
    var replacement = replaceStaticString(str, options);
    return replacement;
}

function undefinedAsString(replacement)
{
    if (replacement === '[][[]]')
        replacement += '+[]';
    return replacement;
}

/**
 * Replaces a given array of strings with equivalent JSFuck code.
 *
 * Array elements may only contain characters with static definitions in their string
 * representations.
 *
 * @function Encoder#replaceStringArray
 *
 * @param {string[]} array
 * The string array to replace. Empty arrays are not supported.
 *
 * @param {Delimiter[]} insertions
 * An array of delimiters of which at most one will be used to compose a joined string and split it
 * into an array of strings.
 *
 * The encoder can pick an insertion and insert a joiner between any two adjacent elements to mark
 * the boundary between them. The separator is then used to split the concatenated string back into
 * its elements.
 *
 * @param {Delimiter[]|null} [substitutions]
 * An array of delimiters, specifying substitutions to be applied to the input elements.
 *
 * All substitutions are applied on each element of the input array, in the order they are
 * specified.
 *
 * Substitutions are expensive in two ways: they create additional overhead and prevent certain
 * optimizations for short arrays to be made. To allow all optimizations to be performed, omit this
 * argument or set it to null instead of specifying an empty array.
 *
 * @param {boolean} [allowZeroForEmptyElements=false]
 * Indicates whether empty string elements in the input array may be replaced with zeros.
 *
 * @param {boolean} [forceString=false]
 * Indicates whether the elements in the replacement expression should evaluate to strings.
 *
 * If this argument is falsy, the elements in the replacement expression may not be equal to those
 * in the input array, but will have the same string representation.
 *
 * Regardless of this argument, the string representation of the value of the whole replacement
 * expression will be always the same as the string representation of the input array after applying
 * substitutions (including optional empty string to zero replacements) to its elements.
 *
 * @param {number} [maxLength=(NaN)]
 * The maximum length of the replacement expression.
 *
 * If the replacement expression exceeds the specified length, the return value is `undefined`.
 *
 * If this parameter is `NaN`, then no length limit is imposed.
 *
 * @returns {string|undefined}
 * The replacement string or `undefined`.
 */
export default function replaceStringArray
(array, insertions, substitutions, allowZeroForEmptyElements, forceString, maxLength)
{
    var replacement;
    var count = array.length;
    // Don't even try the split approach for two or less elements if the concat approach can be
    // applied.
    if (substitutions || count > 2)
    {
        var preReplacement =
        function ()
        {
            // Length of the shortest string replacement "([]+[])".
            var STRING_REPLACEMENT_MIN_LENGTH = 7;

            // This is for the overhead of "[" + "](" + ")" plus the length of the shortest
            // separator replacement "[]".
            var SEPARATOR_MIN_OVERHEAD = 6;

            // This is for the overhead of "[" + "](" + ")" plus the length of the shortest
            // joiner replacement "[]".
            var JOINER_MIN_OVERHEAD = 6;

            var joinCount = substitutions ? substitutions.length : 0;
            var splitCount = joinCount + 1;
            var maxSplitReplacementLength =
            (maxLength - STRING_REPLACEMENT_MIN_LENGTH) / splitCount - SEPARATOR_MIN_OVERHEAD;
            var splitReplacement =
            this.replaceString('split', { maxLength: maxSplitReplacementLength, optimize: true });
            if (!splitReplacement)
                return;
            var preReplacement = '';
            if (joinCount)
            {
                var maxJoinReplacementLength =
                (
                    maxLength - STRING_REPLACEMENT_MIN_LENGTH -
                    splitCount * (splitReplacement.length + SEPARATOR_MIN_OVERHEAD)
                ) /
                joinCount -
                JOINER_MIN_OVERHEAD;
                var joinReplacement =
                this.replaceString('join', { maxLength: maxJoinReplacementLength });
                if (!joinReplacement)
                    return;
                substitutions.forEach
                (
                    function (substitution)
                    {
                        var separatorReplacement =
                        undefinedAsString(this.replaceExpr(substitution.separator));
                        var joinerReplacement =
                        undefinedAsString(this.replaceString(substitution.joiner));
                        preReplacement +=
                        '[' + splitReplacement + '](' + separatorReplacement + ')[' +
                        joinReplacement + '](' + joinerReplacement + ')';
                    },
                    this
                );
            }
            preReplacement += '[' + splitReplacement + ']';
            return preReplacement;
        }
        .call(this);
    }
    if (!substitutions && count > 1)
    {
        var concatReplacement =
        this.replaceString('concat', { maxLength: maxLength, optimize: true });
    }
    if (preReplacement)
    // Approach 1: (array[0] + joiner + array[1] + joiner + array[2]...).split(separator)
    {
        // 2 is for the additional overhead of "(" + ")".
        var maxBulkLength = maxLength - (preReplacement.length + 2);
        var optimalStrReplacement;
        var optimalSeparatorReplacement;
        insertions.forEach
        (
            function (insertion)
            {
                var strReplacement =
                replaceJoinedArrayString(array, insertion.joiner, maxBulkLength);
                if (!strReplacement)
                    return;
                var separatorReplacement = undefinedAsString(this.replaceExpr(insertion.separator));
                var bulkLength = strReplacement.length + separatorReplacement.length;
                if (!(bulkLength > maxBulkLength))
                {
                    maxBulkLength = bulkLength;
                    optimalStrReplacement = strReplacement;
                    optimalSeparatorReplacement = separatorReplacement;
                }
            },
            this
        );
        if (optimalStrReplacement)
        {
            replacement =
            optimalStrReplacement + preReplacement + '(' + optimalSeparatorReplacement + ')';
            maxLength = replacement.length - 1;
        }
    }
    if
    (
        !substitutions &&
        (
            count <= 1 ||
            concatReplacement &&
            // 4 is the length of the shortest possible replacement "[[]]".
            // 7 is the length of the shortest possible additional overhead for each following array
            // element, as in "[" + "](+[])" or "[" + "](![])".
            !(4 + (concatReplacement.length + 7) * (count - 1) > maxLength)
        )
    )
    // Approach 2: [array[0]].concat(array[1]).concat(array[2])...
    {
        var arrayReplacement;
        var options = { screwMode: forceString ? SCREW_AS_STRING : SCREW_NORMAL };
        if
        (
            !array.some
            (
                function (element)
                {
                    var elementReplacement =
                    undefinedAsString(replaceStaticString(element, options));
                    if (arrayReplacement)
                    {
                        if (elementReplacement === '[]')
                            elementReplacement = allowZeroForEmptyElements ? '+[]' : '[[]]';
                        arrayReplacement +=
                        '[' + concatReplacement + '](' + elementReplacement + ')';
                    }
                    else
                        arrayReplacement = '[' + elementReplacement + ']';
                    var result = arrayReplacement.length > maxLength;
                    return result;
                }
            )
        )
            replacement = arrayReplacement;
    }
    return replacement;
}
