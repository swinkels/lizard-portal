(function() {

  Ext.define('Lizard.form.WorkspaceSaveForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.workspacesaveform',
    defaultType: 'textfield',
    bodyStyle: 'padding:5px',
    defaults: {
      anchor: '100%'
    },
    width: 400,
    save_callback: Ext.emptyFn,
    items: [
      {
        xtype: 'radiogroup',
        name: 'save_method',
        fieldLabel: 'Overschrijven?',
        columns: 1,
        vertical: true,
        items: [
          {
            boxLabel: 'Geladen workspace overschrijven',
            name: 'method',
            inputValue: 'update'
          }, {
            boxLabel: 'Opslaan als nieuwe workspace',
            name: 'method',
            inputValue: 'create'
          }
        ]
      }, {
        fieldLabel: 'Naam',
        name: 'name',
        allowBlank: false
      }, {
        fieldLabel: 'Persoonlijk tag',
        name: 'personal_category',
        allowBlank: true
      }, {
        xtype: 'checkbox',
        fieldLabel: 'met achtergrond',
        name: 'including_background',
        defaultValue: false
      }
    ],
    bbar: [
      {
        text: 'Annuleren',
        handler: function(btn, event) {
          var window;
          window = this.up('window');
          return window.close();
        }
      }, {
        text: 'Opslaan',
        handler: function(btn, event) {
          var form, form_values, layers, order_nr, panel, workspace, workspace_layers;
          panel = this.up('form');
          form = panel.getForm();
          if (form.isValid()) {
            form_values = form.getValues();
            if (form_values.method === 'update') {
              workspace = form.workspaceStore.first();
            } else {
              workspace = Ext.create('Lizard.model.WorkspaceModel', {});
            }
            workspace.set('name', form_values.name);
            workspace.set('personal_category', form_values.personal_category);
            layers = form.layerStore;
            workspace_layers = [];
            order_nr = 100;
            layers.each(function(record) {
              if (!form_values.including_background && record.get('is_base_layer')) {
                return;
              }
              record.order = order_nr;
              order_nr -= 1;
              record.commit();
              workspace_layers.push(record.store.proxy.writer.getRecordData(record));
            });
            workspace.set('layers', workspace_layers);
            panel.setLoading(true);
            return workspace.save({
              callback: function(record, operation) {
                var window;
                if (operation.wasSuccessful()) {
                  form.workspaceStore.removeAll();
                  form.workspaceStore.add(record);
                  window = panel.up('window');
                  window.close();
                }
                panel.setLoading(true);
                return panel.save_callback(record, operation);
              }
            });
          } else {
            return Ext.MessageBox.alert('Invoer fout', 'Kies geldige periode');
          }
        }
      }
    ],
    afterRender: function() {
      var bla, form, save_method;
      form = this.getForm();
      save_method = form.findField('save_method');
      if (this.workspaceStore.count() > 0 && !this.workspaceStore.first().get('read_only')) {
        bla = this.workspaceStore.first().get('read_only');
        save_method = form.findField('save_method');
        save_method.setValue({
          method: 'update'
        });
        form.findField('name').setValue(this.workspaceStore.first().get('name'));
        return form.findField('personal_category').setValue(this.workspaceStore.first().get('personal_category'));
      } else {
        save_method.setValue({
          method: 'create'
        });
        return save_method.setDisabled(true);
      }
    }
  });

}).call(this);
