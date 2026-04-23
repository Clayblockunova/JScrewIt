import { _Array_prototype_slice_call } from './obj-utils';

export default function joinWithMaxLength(maxLength)
{
    for (var index = arguments.length; ;)
    {
        if (maxLength < 0)
            return;
        if (--index < 1)
            break;
        var str = arguments[index];
        maxLength -= str.length;
    }
    var array = _Array_prototype_slice_call(arguments, 1);
    var result = array.join('');
    return result;
}
