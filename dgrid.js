let head = document.getElementsByTagName('HEAD')[0];
let link = document.createElement('link');
let dgrid = document.createElement('script');
let modulePath = '/sites/all/modules/dgridpage';

link.rel = 'stylesheet';  
link.type = 'text/css'; 
link.href = modulePath + '/dgrid.css';

head.appendChild(link);

require({
	packages: [{
		name: 'dgrid',
		location: '/dojo/dgrid'
	}, {
		name: 'xstyle',
		location:'/dojo/xstyle'
	}, {
		name: 'put-selector',
		location: '/dojo/put-selector'
	}, {
		name: 'dgridpage',
		location: modulePath
	}]
},[
	'dojo/_base/declare',
	'dgrid/OnDemandGrid',
	'dgridpage/RowFilter',
	'dgrid/Selection',
	'dgrid/Keyboard',
	'dgrid/Editor',
	'dstore/Memory',
	'dstore/Trackable',
	'dojo/request',
	'dgrid/extensions/ColumnResizer',
	'dgrid/extensions/ColumnHider',
	'dojo/domReady!'
], function (declare, OnDemandGrid, RowFilter, Selection, Keyboard,
			 Editor, Memory, Trackable, request, ColumnResizer, ColumnHider) {
	request(modulePath + '/hof-batting.json', {
		handleAs: "json"
	}).then(function (response) {
		let store = new (declare([Memory, Trackable]))({
			data: response
		});

		// Instantiate grid
		let grid = new (declare([OnDemandGrid, RowFilter, Selection,
			Keyboard, Editor, ColumnResizer, ColumnHider]))({
			collection: store,
			columns: {
				First_Name: {
					label: 'First Name',
					field: 'first',
					editOn: 'click',
					editor: 'text',
					autoSave: true
				},
				Last_Name: {
					label: 'Last Name',
					field: 'last',
					editOn: 'click',
					editor: 'text',
					autoSave: true
				},
				Nickname: {
					label: 'Nickname',
					field: 'nickname',
					editOn: 'click',
					editor: 'text',
					autoSave: true
				},
				Birth_Date: {
					label: 'Birth Date',
					field: 'birthDate',
					editOn: 'click',
					editor: 'text',
					autoSave: true
				},
				Games_Played: {
					label: 'Games Played',
					field: 'totalG',
					editOn: 'click',
					editor: 'text',
					autoSave: true
				},
				Debut: {
					label: 'Debut',
					field: 'debut',
					editOn: 'click',
					editor: 'text',
					autoSave: true
				},
				Final_Game: {
					label: 'Final Game',
					field: 'finalGame',
					editOn: 'click',
					editor: 'text',
					autoSave: true
				}
			}
		}, 'grid');

		grid.filterHandler = function (filters) {
			let collection = store.filter(function (item) {
				for (let filter in filters) {
					if (!item[filter] && filters[filter]) {
						return false;
					} else if (!item[filter]) {
						continue;
					}

					if (item[filter].toString().indexOf(filters[filter]) === -1) {
						return false;
					}
				}
				return true;
			});

			grid.set("collection", collection);
		};

		grid.startup();
	})
});
