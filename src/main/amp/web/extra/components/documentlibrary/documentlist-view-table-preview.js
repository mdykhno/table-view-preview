/**
 * Copyright (C) 2005-2012 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @module DocumentLibrary
 */

/**
 * Table view extension of DocumentListViewRenderer component.
 *
 * @namespace Alfresco
 * @class Alfresco.DocumentListTableViewRendererPreview
 * @extends Alfresco.DocumentListViewRenderer
 */
(function()
{
    /**
     * YUI Library aliases
     */
    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        Anim = YAHOO.util.Anim;

    /**
     * Alfresco Slingshot aliases
     */
    var $html = Alfresco.util.encodeHTML,
        $isValueSet = Alfresco.util.isValueSet;

    var DND_CONTAINER_ID = 'ygddfdiv';

    /**
     * TableViewRenderer constructor.
     *
     * @param name {String} The name of the TableViewRenderer
     * @return {Alfresco.DocumentListTableViewRendererPreview} The new TableViewRenderer instance
     * @constructor
     */
    Alfresco.DocumentListTableViewRendererPreview = function(name, parentDocumentList, jsonConfig)
    {
        Alfresco.DocumentListTableViewRendererPreview.superclass.constructor.call(this, name, parentDocumentList);
        this.actionsColumnWidth = 160;
        this.actionsSplitAtModifier = 0;
        if (jsonConfig != null)
        {
            this.jsonConfig = jsonConfig;
            this.additionalJsonConfig = YAHOO.lang.JSON.parse(jsonConfig);
        }
        else
        {
            this.additionalJsonConfig = {};
        }
        return this;
    };

    /**
     * Extend from Alfresco.DocumentListViewRenderer
     */
    YAHOO.extend(Alfresco.DocumentListTableViewRendererPreview, Alfresco.DocumentListViewRenderer);

    /**
     * @method getConfigWidth
     * @param propColumn {object}
     */
    Alfresco.DocumentListTableViewRendererPreview.prototype.getConfigWidth = function(propColumn)
    {
        var width = null;
        var rawWidth = propColumn.width;
        if (rawWidth != null)
        {
            width = parseInt(rawWidth);
            if (width === NaN)
            {
                width = null;
            }
        }
        return width;
    };

    /**
     * @see Alfresco.DocumentListViewRenderer.renderView
     */
    Alfresco.DocumentListTableViewRendererPreview.prototype.renderView = function DL_SVR_renderView(scope, sRequest, oResponse, oPayload)
    {
        // Add a class to help with CSS selectors...
        var container = Dom.get(scope.id + this.parentElementIdSuffix);
        Dom.addClass(container, 'alf-table');

        var viewRendererInstance = this;

        scope.widgets.dataTable.set('draggableColumns', false);

        var container = Dom.get(scope.id + this.parentElementIdSuffix);
        var oRecordSet = scope.widgets.dataTable.getRecordSet();
        Dom.addClass(container, 'alf-table');
        Dom.removeClass(Dom.get(scope.id + "-table-config-button-container"), 'hidden');


        //todo: preview code start


        this.parentDocumentList.widgets.dataTable.subscribe("cellClickEvent",
            this.onDataTableCellClickCallBack, this, true);

 this.parentDocumentList.widgets.dataTable.subscribe("renderEvent",
            this.onDataTableRenderEventCallBack, this, true);

        //nodeRef=firstFoundFile!=null ? firstFoundFile.nodeRef :
        //
        //// Render the web-preview for the first file in datatable
        //Alfresco.util.loadWebscript(
        //    {
        //        url: Alfresco.constants.URL_SERVICECONTEXT + "/components/preview/web-preview",
        //        properties: { nodeRef: nodeRef },
        //        target: preview_container
        //    });

        //todo: preview code end

        // Always hide the fileName column...
        // This has been done due to time-constraints and the issues surrounding the other views (most notably the detailed
        // and simple views) changing the widths of the fileName field. The simplest solution was to just always hide this
        // field and rely on the JSON blob to add in columns that identify the item.
        scope.widgets.dataTable.hideColumn("fileName");

        // Not all of the columns are properties, the selector, indicators and actions are not properties and
        // need to be handled by specific configuration defined in the JSON BLOB...
        if (this.additionalJsonConfig != null)
        {
            // Add/remove actions column as appropriate
            if (this.additionalJsonConfig.actions != null && this.additionalJsonConfig.actions.show == "false")
            {
                scope.widgets.dataTable.hideColumn("actions");
            }
            else
            {
                scope.widgets.dataTable.showColumn("actions");
            }

            // Add/remove the indicators column...
            if (this.additionalJsonConfig.indicators != null && this.additionalJsonConfig.indicators.show == "false")
            {
                scope.widgets.dataTable.hideColumn("status");
            }
            else
            {
                scope.widgets.dataTable.showColumn("status");
            }

            // Add/remove the selection box column...
            if (this.additionalJsonConfig.selector != null && this.additionalJsonConfig.selector.show == "false")
            {
                scope.widgets.dataTable.hideColumn("nodeRef");
            }
            else
            {
                scope.widgets.dataTable.showColumn("nodeRef");
            }

            // Add/remove the thumbnail column...
            if (this.additionalJsonConfig.thumbnail != null && this.additionalJsonConfig.thumbnail.show == "false")
            {
                scope.widgets.dataTable.hideColumn("thumbnail");
            }
            else
            {
                scope.widgets.dataTable.showColumn("thumbnail");
            }

            // If a JSON blob has been provided then is should define the columns that need to be
            // rendered in the detailed view. Iterate over this configuration and add in the columns
            // defined making use of the data provided...
            if (this.additionalJsonConfig.propertyColumns != null &&
                this.additionalJsonConfig.propertyColumns.length != null)
            {
                for (var i=0; i<this.additionalJsonConfig.propertyColumns.length; i++)
                {
                    var propColumn = this.additionalJsonConfig.propertyColumns[i];
                    if (propColumn.property != null)
                    {
                        var width = null;
                        var rawWidth = propColumn.width;
                        if (rawWidth != null)
                        {
                            width = parseInt(rawWidth);
                            if (width === NaN)
                            {
                                width = null;
                            }
                        }

                        var columnDef = {
                            key: propColumn.property,
                            label: propColumn.property,
                            formatter: (propColumn.link == "true") ? this.fnRenderCellLinkProperty() : this.fnRenderCellProperty(),
                            sortable: false,
                            width: this.getConfigWidth(propColumn)
                        };
                        if (propColumn.label != null)
                        {
                            columnDef.label = scope.msg(propColumn.label);
                        }
                        scope.widgets.dataTable.insertColumn(columnDef);
                    }
                }
            }

            // In order to ensure that the actions column always appears at the end we're goign to remove it and
            // then re-insert it. This is necessary because attempts at inserting the additional columns before
            // the actions column always resulted in unexplainable errors and this was the quickest solution to the
            // problem. It is however only necessary when the actions column is going to be displayed and in
            // actual fact causes more errors if this is attempted after the actions column is hidden...
            if (this.additionalJsonConfig.actions == null || this.additionalJsonConfig.actions.show == "true")
            {
                var actionsColumn = scope.widgets.dataTable.removeColumn("actions");
                scope.widgets.dataTable.insertColumn(actionsColumn);
            }

            // Get the current sort data...
            var oSortedBy = scope.widgets.dataTable.get("sortedBy") || {};
            var oState = scope.widgets.dataTable.getState();

            YAHOO.util.Dom.setStyle(scope.id + this.parentElementIdSuffix, 'display', '');
            scope.widgets.dataTable.onDataReturnInitializeTable.call(scope.widgets.dataTable, sRequest, oResponse, oPayload);

            // Reset the sort state...
            scope.widgets.dataTable.set('sortedBy', oState.sortedBy);
        }
    };

    /**
     * @see Alfresco.DocumentListViewRenderer.renderCellThumbnail
     */
    Alfresco.DocumentListTableViewRendererPreview.prototype.renderCellThumbnail = function DL_SVR_renderCellThumbnail(scope, elCell, oRecord, oColumn, oData)
    {
        var record = oRecord.getData(),
            node = record.jsNode,
            properties = node.properties,
            name = record.displayName,
            isContainer = node.isContainer,
            isLink = node.isLink,
            extn = name.substring(name.lastIndexOf(".")),
            imgId = node.nodeRef.nodeRef; // DD added

        var containerTarget; // This will only get set if thumbnail represents a container

        oColumn.width = 16;

        if (YAHOO.env.ua.ie > 0)
        {
            try
            {
                scope.widgets.dataTable._elThead.children[0].children[2].children[0].style.width = "16px";
            }
            catch (e)
            {
                // Deliberately swallowing any generated exceptions without remorse.
            }

        }

        Dom.setStyle(elCell, "width", oColumn.width + "px");
        Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

        if (isContainer)
        {
            elCell.innerHTML = '<span class="folder-small">' + (isLink ? '<span class="link"></span>' : '') + (scope.dragAndDropEnabled ? '<span class="droppable"></span>' : '') + Alfresco.DocumentList.generateFileFolderLinkMarkup(scope, record) + '<img id="' + imgId + '" src="' + Alfresco.constants.URL_RESCONTEXT + 'components/documentlibrary/images/folder-32.png" /></a>';
        }
        else
        {
            var id = scope.id + '-preview-' + oRecord.getId();
            elCell.innerHTML = '<span id="' + id + '" class="thumbnail">' + (isLink ? '<span class="link"></span>' : '') + Alfresco.DocumentList.generateFileFolderLinkMarkup(scope, record) + '<img id="' + imgId + '" src="' + Alfresco.DocumentList.generateThumbnailUrl(record) + '" alt="' + extn + '" title="' + $html(name) + '" /></a></span>';

            // Preview tooltip
            scope.previewTooltips.push(id);
        }
    };

    /**
     * @see Alfresco.DocumentListViewRenderer.destroyView
     */
    Alfresco.DocumentListTableViewRendererPreview.prototype.destroyView = function DL_SVR_destroyView(scope, sRequest, oResponse, oPayload)
    {
        Alfresco.DocumentListTableViewRendererPreview.superclass.destroyView.call(this, scope, sRequest, oResponse, oPayload);

        // This gets called even before the view has first been created, so we need to ensure we have the original
        // set of columns so that they can be restored for the benefit of other views...
        var viewRendererInstance=this;

        var container = Dom.get(scope.id + this.parentElementIdSuffix).parentNode;

            Dom.removeClass(container, 'no-width');
            Dom.removeClass(container, 'width-one-third');

        scope.widgets.dataTable.unsubscribe("cellClickEvent",
            this.onDataTableCellClickCallBack, this);
        
        scope.widgets.dataTable.unsubscribe("renderEvent",
            this.onDataTableRenderEventCallBack, this);

        var preview_container = Dom.get(scope.id+"-"+"previewer-div");
        if (preview_container!=null)
        preview_container.parentNode.removeChild(preview_container);

        if (!this.originalColumnDefinitions)
        {
            // Save the originalColumnDefinitions
            this.originalColumnDefinitions = [];
            var columnDefinitions = scope.widgets.dataTable.getColumnSet().getDefinitions();
            for (var i = 0; i < columnDefinitions.length; i++)
            {
                this.originalColumnDefinitions[i] = columnDefinitions[i];
            }
        }

        var container = Dom.get(scope.id + this.parentElementIdSuffix);
        Dom.removeClass(container, 'alf-table');
        Dom.addClass(Dom.get(scope.id + "-table-config-button-container"), 'hidden');


        // Rebuild the original columns...
        if (this.originalColumnDefinitions)
        {
            // Ensure that all the "core" columns are displayed again (these columns are the ones that
            // were defined by the original detailed view and need to be in place for the other views
            // to continue to work...
            scope.widgets.dataTable.showColumn("nodeRef");
            scope.widgets.dataTable.showColumn("status");
            scope.widgets.dataTable.showColumn("thumbnail");
            scope.widgets.dataTable.showColumn("fileName");
            scope.widgets.dataTable.showColumn("actions");

            // Remove all the current columns (except for those core columns)...
            var currentColumnDefinitions = [];
            var currentColumnDefinitionsCall = scope.widgets.dataTable.getColumnSet().getDefinitions();

            // currentColumnDefinitionsCall changes during iteration
            for (var i = 0; i < currentColumnDefinitionsCall.length; i++)
            {
                switch (currentColumnDefinitionsCall[i].key)
                {
                    case "nodeRef":
                    case "status":
                    case "thumbnail":
                    case "fileName":
                    case "actions":
                        break;
                    default:
                        scope.widgets.dataTable.removeColumn(currentColumnDefinitionsCall[i].key);
                }
            }

            // Add back in any of the original columns that have since been deleted (typically this
            // won't actually add anything back)...
            for (var i = 0; i < this.originalColumnDefinitions.length; i++)
            {
                switch (this.originalColumnDefinitions[i].key)
                {
                    case "nodeRef":
                    case "status":
                    case "thumbnail":
                    case "fileName":
                    case "actions":
                        break;
                    default:
                        scope.widgets.dataTable.insertColumn(this.originalColumnDefinitions[i]);
                }
            }
        }
    };

    /**
     * Generic string custom datacell formatter
     *
     * @method renderCellGenericString
     * @param elCell {object}
     * @param oRecord {object}
     * @param oColumn {object}
     * @param oData {object|string}
     */
    Alfresco.DocumentListTableViewRendererPreview.prototype.renderCellGenericString = function DL_SVR_renderCellGenericString(elCell, oRecord, oColumn, oData)
    {
        var record = oRecord.getData(),
            node = record.jsNode,
            properties = node.properties,
            propertyValue = properties[oColumn.field];
        if (propertyValue != null)
        {
            elCell.innerHTML = '<span class="alf-generic-property">' + propertyValue + '</span>';
        }
    };

    /**
     * Uses a defined metadata 'line' template and renderer as a custom datacell formatter
     *
     * @method renderCellMetadataLineRenderer
     * @param scope {object} The DocumentList object
     * @param elCell {object}
     * @param oRecord {object}
     * @param oColumn {object}
     * @param oData {object|string}
     * @param line {object} the metadata 'line' object
     */
    Alfresco.DocumentListTableViewRendererPreview.prototype.renderCellMetadataLineRenderer = function DL_SVR_renderCellMetadataLineRenderer(scope, elCell, oRecord, oColumn, oData, line)
    {
        var desc = "", i, j,
            record = oRecord.getData(),
            jsNode = record.jsNode;

        var fnRenderTemplate = function fnRenderTemplate_substitute(p_key, p_value, p_meta)
        {
            var label = (p_meta !== null ? '<em>' + scope.msg(p_meta) + '</em>: ': ''),
                value = "";

            // render value from properties or custom renderer
            if (scope.renderers.hasOwnProperty(p_key) && typeof scope.renderers[p_key] === "function")
            {
                value = scope.renderers[p_key].call(scope, record, label);
            }
            else
            {
                if (jsNode.hasProperty(p_key))
                {
                    value = '<span class="item">' + label + $html(jsNode.properties[p_key]) + '</span>';
                }
            }

            return value;
        };

        var html;
        if (!$isValueSet(line.view) || line.view == this.metadataLineViewName)
        {
            html = YAHOO.lang.substitute(line.template, scope.renderers, fnRenderTemplate);
            if ($isValueSet(html))
            {
                desc += '<div class="detail">' + html + '</div>';
            }
        }

        elCell.innerHTML = desc;
    };

    Alfresco.DocumentListTableViewRendererPreview.prototype.renderWebPreview = function DL_FVR_renderWebPreview(scope, record)
    {
        //var containerTarget; // This will only get set if thumbnail represents a container
        //
        //var oRecordSet = scope.widgets.dataTable.getRecordSet();

        if (record!=null)
        {
            var oRecord = record;
            var recordData = oRecord.getData();
            var itemId = scope.id+"-"+oRecord.getId();
            var itemPreviewDiv = document.getElementById(scope.id+"-"+oRecord.getId());

            if (itemPreviewDiv==null) {

                var previewerDiv = Dom.get(scope.id+"-"+"previewer-div");
                itemPreviewDiv = document.createElement("div");
                itemPreviewDiv.id=itemId;
                Dom.addClass(itemPreviewDiv,"selected");
                previewerDiv.appendChild(itemPreviewDiv);
            } else {
                    Dom.removeClass(itemPreviewDiv, "hidden");
                    Dom.addClass(itemPreviewDiv, "selected");
            }

            var thumbnail = this.getThumbnail(
                scope, itemPreviewDiv, oRecord, null, null, '-filmstrip-main-content');

            if (thumbnail.isContainer)
            {
                if (!document.getElementById(thumbnail.id))
                {
                    //itemPreviewDiv.innerHTML += '<span class="folder">' + (thumbnail.isLink ? '<span class="link"></span>' : '') +
                    //Alfresco.DocumentList.generateFileFolderLinkMarkup(scope, recordData) + thumbnail.html + '</a>';
                    itemPreviewDiv.innerHTML = '<span class="docListInstructionTitle" id="yui-gen442">'+Alfresco.messages Drag and drop to upload files!</span>';
                }
            }
            else
            {
                // Image web preview may still be present so only render if web-preview doesn't exist
                var galleryItemThumbnailDivChildren = Dom.getElementsByClassName('web-preview', 'div', itemPreviewDiv);
                if (galleryItemThumbnailDivChildren == null || galleryItemThumbnailDivChildren.length == 0)
                {
                    // Render the web-preview for the filmstrip item
                    Alfresco.util.loadWebscript(
                        {
                            url: Alfresco.constants.URL_SERVICECONTEXT + "/components/preview/web-preview",
                            properties: { nodeRef: recordData.nodeRef },
                            target: itemPreviewDiv
                        });
                }
            }
        }
    };

    Alfresco.DocumentListTableViewRendererPreview.prototype.destroyWebPreview = function DL_FVR_destroyWebPreview(scope, record)
    {
        var previewerDiv = Dom.get(scope.id+"-"+"previewer-div");

        var previewSelectedDiv = Dom.getElementsByClassName('selected', 'div', previewerDiv);

        if (previewSelectedDiv != null) {
            Dom.removeClass(previewSelectedDiv, "selected");
            Dom.addClass(previewSelectedDiv, "hidden");
        }

    };

    Alfresco.DocumentListTableViewRendererPreview.prototype.onDataTableContentChanged = function DL_FVR_onFilmstripMainContentChanged(scope, record)
    {
        if (scope != null)
        {
            this.destroyWebPreview(scope, record);
            this.renderWebPreview(scope, record);
            //var pageNum = scope.widgets.filmstripNavCarousel.getPageForItem(index) - 1;
            //var currentPage = scope.widgets.filmstripNavCarousel.get('currentPage');
            //if (pageNum != currentPage)
            //{
            //    var firstOnPage = scope.widgets.filmstripNavCarousel.getFirstVisibleOnPage(pageNum + 1);
            //    scope.widgets.filmstripNavCarousel.scrollTo(firstOnPage, true);
            //}
        }
    };

    Alfresco.DocumentListTableViewRendererPreview.prototype.onDataTableCellClick = function DL_FVR_onDataTableCellClick(scope, event)
    {
        var target = YAHOO.util.Event.getTarget(event);

       if (YAHOO.util.Selector.test(target, '.yui-dt-col-name')) {
           event.event.stopPropagation();
           event.event.preventDefault();
           var row = this.parentDocumentList.widgets.dataTable.getRow(target.id);
           var record = this.parentDocumentList.widgets.dataTable.getRecord(row.id);
           this.onDataTableContentChanged(scope,record);


       }
    };

    Alfresco.DocumentListTableViewRendererPreview.prototype.getThumbnail = function DL_GVR_getThumbnail(scope, elCell, oRecord, oColumn, oData, imgIdSuffix, renditionName)
    {
        if (imgIdSuffix == null)
        {
            imgIdSuffix = "-hidden";
        }
        if (renditionName == null)
        {
            renditionName = "imgpreview";
        }

        var record = oRecord.getData(),
            node = record.jsNode,
            properties = node.properties,
            name = record.displayName,
            isContainer = node.isContainer,
            isLink = node.isLink,
            extn = name.substring(name.lastIndexOf(".")),
            imgId = node.nodeRef.nodeRef + imgIdSuffix, // DD added
            imgHtml;

        if (isContainer)
        {
            imgHtml = '<img id="' + imgId + '" class="alf-gallery-item-thumbnail-img" src="' + Alfresco.constants.URL_RESCONTEXT + 'components/documentlibrary/images/folder-256.png" />';
        }
        else
        {
            imgHtml = '<img id="' + imgId + '" class="alf-gallery-item-thumbnail-img" src="' + Alfresco.DocumentList.generateThumbnailUrl(record, renditionName) + '" alt="' + $html(extn) + '" title="' + $html(name) + '" />';
        }
        return { id: imgId, html: imgHtml, isContainer: isContainer, isLink: isLink };
    };


    Alfresco.DocumentListTableViewRendererPreview.prototype.onDataTableRender = function DL_TVRP_onDataTableRender(scope, event)
    {
        var container = Dom.get(scope.id + this.parentElementIdSuffix).parentNode;
        var preview_container = Dom.get(scope.id+"-"+"previewer-div");
        if (preview_container==null) {
            preview_container = document.createElement("div");
            preview_container.id=scope.id+"-"+"previewer-div";
            Dom.addClass(preview_container, 'previewer');
            Dom.insertAfter(preview_container, container);
        }

        var record = null;
        var isFirstFoundFile = false;
        var records = scope.widgets.dataTable.getRecordSet().getRecords();

        for (var index = 0; index < records.length; index++) {
            var node = records[index].getData("node");
            var record = records[index];
            if (!node.isContainer) {
                record = records[index];
                isFirstFoundFile=true;
                break;
            }
        }

        if (records.length>0) {

            if (isFirstFoundFile) { // if at least one file exists

                Dom.addClass(container, 'width-one-third');
                Dom.removeClass(preview_container, 'previewer-two-third');

            }
            else {
               Dom.addClass(container, 'no-width');
               Dom.removeClass(preview_container, 'previewer');
               Dom.addClass(preview_container, 'previewer-two-third');

            }
            this.renderWebPreview(scope,record);


        }




    };


    Alfresco.DocumentListTableViewRendererPreview.prototype.onDataTableRenderEventCallBack = function (ev) {
        var scope = this.parentDocumentList;
        this.onDataTableRender(scope, ev);
    };

    Alfresco.DocumentListTableViewRendererPreview.prototype.onDataTableCellClickCallBack = function(ev) {
        var scope = this.parentDocumentList;
        this.onDataTableCellClick(scope, ev);
    }




})();

