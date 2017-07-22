
ko.utils.domData = new (function () {
    var uniqueId = 0;
    var dataStoreKeyExpandoPropertyName = "__ko__" + (new Date).getTime();
    var dataStore = {};

    var getDataForNode, clear;
    if (!ko.utils.ieVersion) {
        getDataForNode = function (node, createIfNotFound) {
            var dataForNode = node[dataStoreKeyExpandoPropertyName];
            if (!dataForNode && createIfNotFound) {
                dataForNode = node[dataStoreKeyExpandoPropertyName] = {};
            }
            return dataForNode;
        };
        clear = function (node) {
            if (node[dataStoreKeyExpandoPropertyName]) {
                delete node[dataStoreKeyExpandoPropertyName];
                return true;
            }
            return false;
        };
    } else {
        getDataForNode = function (node, createIfNotFound) {
            var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
            var hasExistingDataStore = dataStoreKey && (dataStoreKey !== "null") && dataStore[dataStoreKey];
            if (!hasExistingDataStore) {
                if (!createIfNotFound)
                    return undefined;
                dataStoreKey = node[dataStoreKeyExpandoPropertyName] = "ko" + uniqueId++;
                dataStore[dataStoreKey] = {};
            }
            return dataStore[dataStoreKey];
        };
        clear = function (node) {
            var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
            if (dataStoreKey) {
                delete dataStore[dataStoreKey];
                node[dataStoreKeyExpandoPropertyName] = null;
                return true; // Exposing "did clean" flag purely so specs can infer whether things have been cleaned up as intended
            }
            return false;
        };
    }

    return {
        get: function (node, key) {
            var dataForNode = getDataForNode(node, false);
            return dataForNode && dataForNode[key];
        },
        set: function (node, key, value) {
            // Make sure we don't actually create a new domData key if we are actually deleting a value
            var dataForNode = getDataForNode(node, value !== undefined /* createIfNotFound */);
            dataForNode && (dataForNode[key] = value);
        },
        clear: clear,

        nextKey: function () {
            return (uniqueId++) + dataStoreKeyExpandoPropertyName;
        }
    };
})();

ko.exportSymbol('utils.domData', ko.utils.domData);
ko.exportSymbol('utils.domData.clear', ko.utils.domData.clear); // Exporting only so specs can clear up after themselves fully
