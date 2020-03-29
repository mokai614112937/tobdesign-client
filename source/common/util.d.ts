declare namespace util {
    function getSpell(str: string, onlyInitial: boolean, upperCaseInitial: boolean): string;
    function title(title: string): void;
    function showErrorMessageBox(msg: string): void;
    function showErrorNotification(msg: string): void;
    function showError(msg: string): void;
    function showSuccess(msg: string): void;
    function findTreeNode(tree: any, key: string, val: any, childName: string ): any;
    function removeTreeNode(tree: any, key: string, val: any, childName: string ): void;
    function findTreeParentNode(tree: any, key: string, val: any, childName: string ): any;
    function validateForm(formRef:any): Promise;
    function loasCSS(url:string, insertBefore: boolean): void;
    function loasJS(url:string): Promise;
    function formatDate(date:Date, fmt: string): string;
    function isEmptyObject(e:any): boolean;
}

declare namespace util.url {
    function getQueryValue(url: string, key: string): string
}

export = util
