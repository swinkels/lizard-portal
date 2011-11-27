#TODO: add editores
#TODO: add renderers
#TODO: finetune save/ cancel/ add/ delete buttons and functionality
#TODO: finetune communication with server, including adding message and answer with id
#TODO: implement editable and visible

Ext.define 'Lizard.store.EditGridStore',
    extend:'Ext.data.Store'
    alias: 'store.leditstore'
    config:
        something: false

    applyParams: (params) ->
        @proxy.extraParams = Ext.merge(@proxy.extraParams, params)
        @load()

    rejectChanges: () ->

        Ext.each(@removed, (rec) ->
            rec.join(@);
            @data.add(rec);
            if Ext.isDefined(@snapshot)
                @snapshot.add(rec)

        , @)
        @removed = [];

        @getUpdatedRecords().forEach((rec) ->
            if rec.dirty == true
                rec.reject()

            if rec.phantom == true
                rec.unjoin(@)
                @data.remove(rec)
                if Ext.isDefined(@snapshot)
                    @snapshot.remove(rec)
        , @)

        @getNewRecords().forEach((rec) ->
            @data.remove(rec)
        , @)
        
        this.fireEvent('datachanged', this);


    constructor: () ->
        @initConfig(arguments)
        @callParent(arguments)
    initComponent: () ->
        me = @


        Ext.apply @
            idProperty: 'id'
            api:
                create: '#{me.proxy.url}action=create' # Called when saving new records
                read: me.proxy.url # Called when reading existing records
                update: '#{me.proxy.url}action=update' # Called when updating existing records
                destroy: '#{me.proxy.url}action=delete' # Called when deleting existing records
            




        @callParent(arguments)
        return @

    listeners:
        write: (store, record, operation) ->
            store.getUpdatedRecords().forEach((rec) ->
                if rec.dirty == true
                    rec.commit()
            )
            Ext.MessageBox.alert('Opslaan gelukt');

