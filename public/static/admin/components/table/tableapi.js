/**
 * 生成一个控制器的：增、删、改、查、排序的操作url
 */
function baTableApi(controllerUrl) {
    this.controllerUrl = controllerUrl;
    this.actionUrl = new Map([
        ['index', controllerUrl + 'index'],
        ['add', controllerUrl + 'add'],
        ['edit', controllerUrl + 'edit'],
        ['del', controllerUrl + 'del'],
        ['sortable', controllerUrl + 'sortable'],
    ]);
}

baTableApi.prototype.index = function (filter = {}) {
    return createAxios({
        url: this.actionUrl.get('index'),
        method: 'get',
        params: filter,
    });
};

baTableApi.prototype.edit = function (params) {
    return createAxios({
        url: this.actionUrl.get('edit'),
        method: 'get',
        params: params,
    });
};

baTableApi.prototype.del = function (ids) {
    return createAxios(
        {
            url: this.actionUrl.get('del'),
            method: 'DELETE',
            params: {
                ids: ids,
            },
        },
        {
            showSuccessMessage: true,
        }
    );
};

baTableApi.prototype.postData = function (action, data) {
    return createAxios(
        {
            url: this.actionUrl.has(action) ? this.actionUrl.get(action) : this.controllerUrl + action,
            method: 'post',
            data: data,
        },
        {
            showSuccessMessage: true,
        }
    );
};

baTableApi.prototype.sortable = function (data) {
    return createAxios({
        url: this.actionUrl.get('sortable'),
        method: 'post',
        data: data,
    });
};