cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-purchase/www/store.js",
        "id": "cordova-plugin-purchase.CdvPurchase",
        "pluginId": "cordova-plugin-purchase",
        "clobbers": [
            "CdvPurchase"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-purchase": "13.8.4"
}
// BOTTOM OF METADATA
});