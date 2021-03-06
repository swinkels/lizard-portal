/**
 * Created by PyCharm.
 * User: bastiaanroos
 * Date: 19-10-11
 * Time: 17:52
 * To change this template use File | Settings | File Templates.
 */
{% load get_portal_template %}
{
    itemId: 'waterbalans',
    title: 'Waterbalans',
	xtype: 'portalpanel',
    breadcrumbs: [{
            name: 'watersysteemkaart',
            link: 'homepage'
        },
        {
            name: 'waterbalans'
        }
    ],
	items:[{
		width: 300,
		items: [{
			title: 'Waterbalans',
            flex:1,
            autoScroll: true,
            plugins: [
                'applycontext'
            ],
            applyParams: function(params) {
                var me = this;
                me.setLoading(true);
                var cm = Ext.getCmp('portalWindow').context_manager.getContext();

                me.loader.load({
                    url: '/wbconfiguration/api/summary/',
                    params: {
                        object_id: cm.object_id
                    },
                    method: 'GET',
                    success: function() {
                      me.setLoading(false);
                    },
                    failure: function() {
                      me.setLoading(false);
                    }
                });
            },
            loader:{
                renderer: 'html'
            },
            bbar: [{
                xtype: 'button',
                text: 'Configuratie',
                iconCls: 'l-icon-setting',
                handler: function(menuItem, checked) {
                    Lizard.CM.setContext({portal_template:'waterbalans-configuratie'});
                }
            }]
		}]
	},{
		flex: 1,
		items: [{
            title: 'Grafieken',
            flex: 1,
            xtype: 'multigraphstore',
            store: Ext.create('Lizard.store.Graph', {data: {% get_portal_template graphs-waterbalans %} })
		}]
	}]
}
