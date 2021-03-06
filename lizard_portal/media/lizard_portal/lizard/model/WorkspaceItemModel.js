(function() {

  Ext.define('Lizard.model.WorkspaceItemModel', {
    extend: 'Ext.data.Model',
    fields: [
      {
        name: "id",
        type: "number"
      }, {
        name: "layer",
        persist: false
      }, {
        name: 'plid',
        mapping: 'plid',
        type: 'auto'
      }, {
        name: 'checked',
        type: 'boolean'
      }, {
        name: 'text',
        type: 'string'
      }, {
        name: 'loading',
        type: 'boolean',
        defaultValue: false,
        persist: false
      }, {
        name: 'leaf',
        type: 'boolean'
      }, {
        name: "title",
        type: "string",
        mapping: "title"
      }, {
        name: "order",
        type: "number",
        mapping: "order"
      }, {
        name: "visibility",
        type: "boolean",
        defaultValue: true,
        mapping: "visibility"
      }, {
        name: "opacity",
        type: "number",
        defaultValue: 0,
        mapping: "opacity"
      }, {
        name: "use_location_filter",
        type: "boolean",
        mapping: "use_location_filter",
        persist: false
      }, {
        name: "location_filter",
        type: "string",
        mapping: "location_filter",
        persist: false
      }, {
        name: "ollayer_class",
        type: "string",
        mapping: "ollayer_class",
        persist: false
      }, {
        name: "url",
        type: "string",
        mapping: "url",
        persist: false
      }, {
        name: "layers",
        type: "string",
        mapping: "layers",
        persist: false
      }, {
        name: "filter",
        type: "string",
        mapping: "filter",
        persist: false
      }, {
        name: "request_params",
        type: "string",
        mapping: "request_params",
        persist: false
      }, {
        name: "is_base_layer",
        type: "boolean",
        mapping: "is_base_layer",
        persist: false
      }, {
        name: "single_tile",
        type: "boolean",
        mapping: "single_tile",
        persist: false
      }, {
        name: "options",
        type: "string",
        mapping: "options",
        persist: false
      }, {
        name: "filter_string",
        type: "string",
        mapping: "filter_string"
      }, {
        name: "is_local_server",
        type: "boolean",
        mapping: "is_local_server",
        persist: false
      }, {
        name: "is_clickable",
        type: "boolean",
        mapping: "is_clickable",
        persist: false
      }, {
        name: "js_popup_class",
        type: "string",
        mapping: "js_popup_class",
        persist: false
      }, {
        name: "clickable",
        type: "boolean",
        defaultValue: false,
        mapping: "clickable",
        convert: function(value, rec) {
          if (rec.get('is_clickable') === true) {
            return value;
          } else {
            return null;
          }
        }
      }
    ],
    getLayer: function() {
      var layer;
      layer = this.get("layer");
      if (!layer) layer = this.createLayer();
      this.data.layer = layer;
      return layer;
    },
    setLayer: function(layer) {
      this.set("layer", layer);
    },
    createLayer: function() {
      var filter, obj, ol_class, options, params, request_params, tpl, url, value;
      ol_class = this.get('ollayer_class');
      if (ol_class === 'OpenLayers.Layer.WMS') {
        try {
          request_params = Ext.JSON.decode(this.get('request_params'));
        } catch (e) {
          request_params = {};
        }
        params = Ext.merge({
          format: 'image/png',
          transparent: !this.get('is_base_layer')
        }, request_params, {
          url: this.get('url'),
          layers: this.get('layers')
        });
        if (this.get('use_location_filter') === true) {
          filter = Ext.JSON.decode(this.get('location_filter'));
          obj = Lizard.CM.getContext().object;
          if (filter.tpl) {
            tpl = new Ext.Template(filter.tpl);
            value = tpl.apply(obj);
          } else {
            value = obj.id;
          }
          params[filter.key] = value;
        }
        if (this.get('filter')) params['cql_filter'] = this.get('filter');
        try {
          options = Ext.JSON.decode(this.get('options'));
        } catch (e) {
          options = {};
        }
        options = Ext.merge({
          displayInLayerSwitcher: true,
          displayOutsideMaxExtent: true,
          visibility: this.get('visibility')
        }, options, {
          isBaseLayer: this.get('is_base_layer'),
          singleTile: this.get('single_tile')
        });
        if (this.get('is_base_layer')) {
          options.projection = new OpenLayers.Projection('EPSG:900913');
          options.init_900913 = true;
          return new OpenLayers.Layer.WMS_baselayer(this.get('title'), this.get('url'), params, options);
        } else {
          return new OpenLayers.Layer.WMS(this.get('title'), this.get('url'), params, options);
        }
      } else if (ol_class === 'OpenLayers.Layer.OSM') {
        try {
          options = Ext.JSON.decode(this.get('options'));
        } catch (e) {
          options = {};
        }
        url = this.get('url');
        if (!url) url = null;
        return new OpenLayers.Layer.OSM(this.get('name'), null, options);
      } else {
        return console.error('dit type wordt niet ondersteund');
      }
    },
    clean_copy: function() {
      var layer;
      layer = this.getLayer().clone();
      delete layer.layer;
      return layer;
    },
    copy: function(id) {
      var layer;
      layer = this.getLayer() && this.getLayer().clone();
      return new this.constructor(Ext.applyIf({
        layer: layer
      }, this.data), id || layer.id);
    }
  });

}).call(this);
