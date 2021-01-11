export interface ISafeStringOption {
    exclude: string | RegExp;
    replaceWith: string;
}

export module ISafeStringOption {
    export const defaults: ISafeStringOption[] = [
        {exclude: /[\/\\\{\}\(\)\s]/g, replaceWith: '_'},
        {exclude: /[\$\^\&\*\%\£\€\~\#\@\!\|\?\'\"\:\;\.]/g, replaceWith: ''}
    ];
}