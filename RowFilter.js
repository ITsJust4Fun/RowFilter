define([
    'dojo/_base/declare',
    'dgrid/OnDemandGrid',
    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/has',
    'dstore/Memory',
    'dstore/Trackable'
], function (declare, OnDemandGrid, domConstruct, domClass, lang, listen, has, Memory, Trackable) {
    return declare(null, {
        destroy: function () {
            if (this._filterListeners) {
                for (let filterListener in this._filterListeners) {
                    filterListener.remove();
                }
            }

            this.inherited(arguments);
        },
        renderHeader: function () {
            if (this.subRows.length > 0) {
                let self = this;
                let headerRows = this.subRows[0];
                this.filters = {};

                for (let i = 0; i < headerRows.length; i++) {
                    let column = headerRows[i];
                    let renderHeaderCell = column.renderHeaderCell;

                    headerRows[i].renderHeaderCell = function (contentNode) {
                        if (renderHeaderCell) {
                            appendIfNode(contentNode, renderHeaderCell(contentNode));
                        } else if ('label' in column || column.field) {
                            contentNode.appendChild(document.createTextNode(
                                'label' in column ? column.label : column.field));

                            let filterElement = document.createElement('input');
                            filterElement.setAttribute('placeholder', 'filter...');
                            filterElement.style.width = '95%';
                            filterElement.classList.add('header-filter');

                            let divElement = document.createElement('div');
                            divElement.appendChild(filterElement);

                            contentNode.appendChild(divElement);

                            if (!self._filterListeners) {
                                self._filterListeners = [];
                            }

                            self.filters[column.field] = '';

                            self._filterListeners.push(listen(filterElement, 'input', function (event) {
                                if (self.filterHandler) {
                                    self.filters[column.field] = filterElement.value;
                                    self.filterHandler(self.filters);
                                }
                            }));
                        }
                    }
                }
            }

            // summary:
            //		Setup the headers for the grid
            var grid = this,
                headerNode = this.headerNode;

            headerNode.setAttribute('role', 'row');

            // clear out existing header in case we're resetting
            domConstruct.empty(headerNode);

            var row = this.createRowCells('th', lang.hitch(this, '_createHeaderRowCell'),
                this.subRows && this.subRows.headerRows);
            this._rowIdToObject[row.id = this.id + '-header'] = this.columns;
            headerNode.appendChild(row);

            // If the columns are sortable, re-sort on clicks.
            // Use a separate listener property to be managed by renderHeader in case
            // of subsequent calls.
            if (this._sortListener) {
                this._sortListener.remove();
            }
            this._sortListener = listen(row, 'click,keydown', function (event) {
                // respond to click, space keypress, or enter keypress
                if (event.type === 'click' || event.keyCode === 32 ||
                    (!has('opera') && event.keyCode === 13)) {
                    var target = event.target;
                    var field;
                    var sort;
                    var newSort;
                    var eventObj;

                    do {
                        if (target.classList.contains('header-filter')) {
                            return;
                        }

                        if (target.sortable) {
                            field = target.field || target.columnId;
                            sort = grid.sort[0];
                            if (!grid.hasNeutralSort || !sort || sort.property !== field || !sort.descending) {
                                // If the user toggled the same column as the active sort,
                                // reverse sort direction
                                newSort = [{
                                    property: field,
                                    descending: sort && sort.property === field &&
                                        !sort.descending
                                }];
                            }
                            else {
                                // If the grid allows neutral sort and user toggled an already-descending column,
                                // clear sort entirely
                                newSort = [];
                            }

                            // Emit an event with the new sort
                            eventObj = {
                                bubbles: true,
                                cancelable: true,
                                grid: grid,
                                parentType: event.type,
                                sort: newSort
                            };

                            if (listen.emit(event.target, 'dgrid-sort', eventObj)) {
                                // Stash node subject to DOM manipulations,
                                // to be referenced then removed by sort()
                                grid._sortNode = target;
                                grid.set('sort', newSort);
                            }

                            break;
                        }
                    } while ((target = target.parentNode) && target !== headerNode);
                }
            });
        }
    });
});
