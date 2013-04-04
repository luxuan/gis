/**
 * Created with JetBrains WebStorm.
 * User: Lius
 * Date: 13-4-3
 * Time: 下午6:18
 * To change this template use File | Settings | File Templates.
 */

dojo.declare(
    "ExtentListener", // 类名
    null, // 无父类，使用null
    {
        _map: null,
        _layers: [],

        constructor: function(map) {
            this._map = map;
        },

        addObserver: function(layer) {
            this._layers.push(layer);
            return this;
        },

        startListen: function() {
            var me = this;
            var notifyObservers = function(extent, delta, levelChange, lod){
                dojo.forEach(me._layers, function(entry, i){
                    entry.update(extent);
                });
            };
            dojo.connect(me._map, "onExtentChange", notifyObservers);

            var gOnMouseOutHandler = function(evt) {
                me._map.infoWindow.hide();
            };
            var gOnMouseOverHandler = function(evt) {
                dojo.forEach(me._layers, function(layer, i){
                    if(layer.setInfoWindow(evt, me._map.infoWindow)){
                        me._map.infoWindow.show(evt.screenPoint);
                        return false;
                    }
                });
            };

            //me._map.graphics初始状态是null，需要有layer加进来后才能设置监听;
            dojo.connect(me._map, "onLayerAdd", function(layer){
                //不能监听图层上的某个特定元素
                dojo.connect(me._map.graphics, "onMouseOver", gOnMouseOverHandler);
                dojo.connect(me._map.graphics, "onMouseOut", gOnMouseOutHandler);
            });

            /*var onZoomEnd = function(extent, zoomFactor, anchor, level){
             console.log('onZoomEnd  extent, zoomFactor, anchor, level',extent, zoomFactor, anchor, level);
             };
             dojo.connect(map, "onZoomEnd", onZoomEnd); //变焦镜头
             */
        }

    }
);
