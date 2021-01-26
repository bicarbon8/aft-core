export interface SafeStringOption {
    exclude: string | RegExp;
    replaceWith: string;
}

export module SafeStringOption {
    export const defaults: SafeStringOption[] = [
        {exclude: /[\/\\\{\}\(\)\,\.\-]/g, replaceWith: '_'},
        {exclude: /[\s]+/g, replaceWith: '_'},
        {exclude: /[\$\^\&\*\%\£\€\~\#\@\!\|\?\'\"\:\;\=\+\[\]]/g, replaceWith: ''}
    ];
}