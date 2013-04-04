dojo.declare(
    "PipeLayer", // 类名
    null, // 无父类，使用null
    {    
        _map: null,
        _url: "",
        _layer: null,
        _xmin: -1,
        _xmax: -1,
        _ymin: -1,
        _ymax: -1,
        _isShow: false,
        _isUpdate: true,
        
        constructor: function(map, url) {
            this._map = map;
            this._url = url;

            this._layer = new esri.layers.ArcGISDynamicMapServiceLayer(url);
            this._layer.setVisibleLayers([0]);//TODO 为什么1,2等其他图层不能按正常显示

            var layerDefinitions = [];
            layerDefinitions[0] = "RES1_4M_ID > 1000";  //"id":0,"name":"省会城市",
            this._layer.setLayerDefinitions(layerDefinitions);

        },

        update: function(extent){
            //console.log('pipe update');
            this._xmin = extent.xmin;
            this._xmax = extent.xmax;
            this._ymin = extent.ymin;
            this._ymax = extent.ymax;
            this._isUpdate = true;
            if(this._isShow) { //刷新显示
//                this.hide();
//                this.show();
            }
        },

        hide: function() {
            this._isShow = false;

            this._map.removeLayer(this._layer);
        },

        show: function() {
            this._isShow = true;

            if(this._isUpdate) { }
            else { }

            this._map.addLayer(this._layer);
        },

        setInfoWindow: function(evt, infoWindow) {
            return false;   //没有监听要素
        }

    }
);
