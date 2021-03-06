(function() {

  Ext.define('Lizard.popup.TimeSeriesGraph', {
    extend: 'Ext.form.Panel',
    startValue: null,
    bodyStyle: 'padding:5px 5px 0',
    defaults: {
      anchor: '100%'
    },
    width: 300,
    init_background: null,
    statics: {
      show: function(records, workspaceitem) {
        var bbar, collage_item_config, collage_item_identifier, dt_end, dt_start, graph_item_html, graph_title, img_html, qua_ident_extra, record, single_record, title, _i, _len;
        dt_start = Ext.Date.format(Lizard.CM.getContext().period.start, 'Y-m-d H:i:s');
        dt_end = Ext.Date.format(Lizard.CM.getContext().period.end, 'Y-m-d H:i:s');
        record = records[0];
        collage_item_identifier = {
          geo_ident: record.data.geo_ident,
          par_ident: record.data.par_ident,
          stp_ident: record.data.stp_ident,
          mod_ident: record.data.mod_ident,
          qua_ident: record.data.qua_ident,
          fews_norm_source_slug: record.data.fews_norm_source_slug
        };
        collage_item_config = {
          name: workspaceitem.get('title') + ' - ' + record.data.geo_ident,
          title: workspaceitem.get('title') + ' - ' + record.data.geo_ident,
          plid: workspaceitem.get('plid'),
          js_popup_class: workspaceitem.get('js_popup_class'),
          identifier: Ext.JSON.encode(collage_item_identifier),
          grouping_hint: 'tijdreeks ' + record.data.par_ident
        };
        graph_item_html = '';
        for (_i = 0, _len = records.length; _i < _len; _i++) {
          single_record = records[_i];
          if (single_record.data.qua_ident) {
            qua_ident_extra = ',%22qua_ident%22:%22' + single_record.data.qua_ident + '%22';
          } else {
            qua_ident_extra = '';
          }
          graph_item_html += '&item={%22fews_norm_source_slug%22:%22' + single_record.data.fews_norm_popup_slug + '%22,%22location%22:%22' + single_record.data.geo_ident + '%22,%22parameter%22:%22' + single_record.data.par_ident + '%22,%22type%22:%22line%22,%22time_step%22:%22' + single_record.data.stp_ident + '%22,%22module%22:%22' + single_record.data.mod_ident + '%22' + qua_ident_extra + '}';
        }
        img_html = '<img src="/graph/?dt_start=' + dt_start + '&dt_end=' + dt_end + '&width=1000&height=550&legend-location=4' + graph_item_html + '" />';
        if (record.data.is_collage_item === true) {
          graph_title = 'Collage popup voor ' + record.data.grouping_hint;
          title = record.data.grouping_hint;
          bbar = [];
        } else {
          graph_title = 'Grafiek voor ' + record.data.geo_ident + ' ' + record.data.par_ident + ' ' + record.data.mod_ident + ' ' + record.data.stp_ident;
          title = workspaceitem.get('title') + ' - ' + record.data.geo_ident;
          bbar = [
            {
              text: 'Voeg toe aan collage',
              handler: function(btn, event) {
                var collage_store;
                collage_store = Lizard.store.CollageStore.get_or_create('analyse');
                return collage_store.collageItemStore.createCollageItem(collage_item_config);
              }
            }
          ];
        }
        bbar.push('->');
        bbar.push({
          text: 'Download csv',
          handler: function(btn, event) {
            return window.open('/graph/?dt_start=' + dt_start + '&dt_end=' + dt_end + graph_item_html + '&format=csv', 'download');
          }
        });
        return Ext.create('Ext.window.Window', {
          title: title,
          modal: true,
          xtype: 'leditgrid',
          itemId: 'map popup',
          finish_edit_function: function(updated_record) {},
          editpopup: true,
          constrainHeader: true,
          items: [
            {
              xtype: 'panel',
              width: 1050,
              height: 600,
              html: graph_title + img_html,
              bbar: bbar
            }
          ]
        }).show();
      }
    },
    items: [{}]
  });

}).call(this);
