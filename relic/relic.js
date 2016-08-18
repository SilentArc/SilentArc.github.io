'use strict';

var settings = {
	'sortByCrafted': true,
	'sortByValue': true,
	'ignoreLowest': false,
	'showRarity': false,
	'showVaulted': true,
	'valueStyles': null
};

function formatStyles(){
	if ( settings.valueStyles === null ){
		var defaultColours = [ '#e6e6fa', '#afeeee', '#e0ffff', '#f5fffa', '#ffefd5', '#ffe4e1', '#ffc0cb' ];
		settings.valueStyles = {};
		for ( let index = 0; index < dataSet.values.length; index++ ){
			settings.valueStyles[ dataSet.values[ index ] ] = ( index < defaultColours.length ? defaultColours[ index ] : '#eee8aa' );
		}
	}

	var valueStyles = '<style id="valueStyles" type="text/css">';
	for ( let index = 0; index < dataSet.values.length; index++ ){
		valueStyles += '.valueStyle' + dataSet.values[ index ] + '{ background-color:' + ( typeof settings.valueStyles[ dataSet.values[ index ] ] === 'string' ? settings.valueStyles[ dataSet.values[ index ] ] : '#eee8aa' ) + ';}';
	}
	valueStyles += '</style>';

	if ( $( '#valueStyles' ).length > 0 ) $( '#valueStyles' ).replaceWith( valueStyles );
	else $( valueStyles ).appendTo( 'head' );
}

function saveSettings(){
	localStorage.setItem( 'settings', JSON.stringify( settings ) );
}

var storedSettings = localStorage.getItem( 'settings' );
if ( typeof storedSettings === 'string' ) {
	try {
		var settingsHolder = JSON.parse( storedSettings );
		var settingsKeys = Object.keys( settings );
		for ( var index = 0; index < settingsKeys.length; index++ ){
			if ( typeof settings[ settingsKeys[ index ] ] !== 'undefined' && typeof settingsHolder[ settingsKeys[ index ] ] !== 'undefined' ) settings[ settingsKeys[ index ] ] = settingsHolder[ settingsKeys[ index ] ];
		}
	} catch( error ){
		console.log( 'Failed to load settings: ' + error );
		saveSettings();
	}
}
formatStyles();

var content = {
	'tier': function(){
		$( '#tile' ).html( '<div class="text">Select a tier to begin:</div><div class="tier outline" data-value="Lith">LITH</div><div class="tier outline" data-value="Meso">MESO</div><div class="tier outline" data-value="Neo">NEO</div><div class="tier outline" data-value="Axi">AXI</div><div class="navButton outline" data-value="vaulted">Vaulted Relic List</div>' );
		currentTier = null;
	},
	'info': function(){
		let html = '<div class="text">Data sourced from http://warframe.wikia.com/wiki/Void_Relic & http://warframe.wikia.com/wiki/Baro_Ki\'Teer </div>';
		html += '<div class="text">Data last updated: ' + new Date( dataSet.buildDate ).toISOString() + '</div>';
		$( '#tile' ).html( html );
		currentTier = null;
	},
	'settings': function(){
		let html = '<div class="options"><div class="text">Settings:</div>';
			html += '<div class="option outline' + ( settings.sortByCrafted === true ? ' active' : '' ) + '" data-value="sortByCrafted">Use crafted value for sorting</div>';
			html += '<div class="option outline' + ( settings.sortByValue === true ? ' active' : '' ) + '" data-value="sortByValue">Sort by value</div>';
			html += '<div class="option outline' + ( settings.ignoreLowest === true ? ' active' : '' ) + '" data-value="ignoreLowest">Ignore lowest value items</div>';
			html += '<div class="option outline' + ( settings.showRarity === true ? ' active' : '' ) + '" data-value="showRarity">Indicate rarity</div>';
			html += '<div class="option outline' + ( settings.showVaulted === true ? ' active' : '' ) + '" data-value="showVaulted">Indicate vaulted status</div>';
			for ( let index = 0; index < dataSet.values.length; index++ ){
				html += '<div class="outline">Value ' + dataSet.values[ index ] + ' <input class="style" data-value="' + dataSet.values[ index ] + '" type="color" value="' + ( typeof settings.valueStyles[ dataSet.values[ index ] ] === 'string' ? settings.valueStyles[ dataSet.values[ index ] ] : '#eee8aa' ) + '" /></div>';
			}			
		html += '</div>';
		$( '#tile' ).html( html );
		currentTier = null;
	},
	'vaulted': function(){
		let html = '<div class="text">Vaulted Relic List:</div>';
		for ( let index = 0; index < dataSet.vaulted.length; index++ ) html += '<div class="text">' + dataSet.vaulted[ index ] + '</div>';
		$( '#tile' ).html( html );
		currentTier = null;
	},
	'relicList': function( tier ){
		currentTier = tier;
		let list = Object.keys( dataSet[ tier ] ).sort();
		let html = '<div class="text">Select 4 relics or fewer and the go button to get a listing:</div>';
		for ( let index = 0; index < list.length; index++ ) html += '<div class="relic outline" data-value="' + list[ index ] + '">' + list[ index ] + '</div>';
		html += '<div class="tableRow"><div id="all" class="go outline">All</div><div id="go" class="go outline">Go</div></div>';
		$( '#tile' ).html( html );
	}
};

var currentTier = null;

$( document ).ready( function(){
	$( '#tile' ).on( 'click', '.tier,#return', function( event ){
		event.preventDefault();
		content.relicList( $( this ).attr( 'data-value' ) );
	});

	$( '#tile' ).on( 'click', '.relic', function( event ){
		event.preventDefault();
		$( this ).toggleClass( 'selected' );

		if ( $( '.selected' ).length === 4 ) createList();
	});

	$( '#tile' ).on( 'click', '#go', function( event ){
		event.preventDefault();
		if ( $( '.selected' ).length > 0 ) createList();
	});

	$( '#tile' ).on( 'click', '#all', function( event ){
		event.preventDefault();
		$( '.relic' ).addClass( 'selected' );
		createList();
	});

	$( '#tile' ).on( 'click', '.option', function( event ){
		event.preventDefault();
		$( this ).toggleClass( 'active' );
		settings[ $( this ).attr( 'data-value' ) ] = ( settings[ $( this ).attr( 'data-value' ) ] === true ? false : true );
		saveSettings();
	});
	$( '#tile' ).on( 'change', '.style', function( event ){
		event.preventDefault();
		settings.valueStyles[ $( this ).attr( 'data-value' ) ] = $( this ).val();
		saveSettings();
		formatStyles();
	});

	$( 'body' ).on( 'click', '.navButton', function( event ){
		event.preventDefault();
		let button = $( this ).attr( 'data-value' );
		if ( typeof content[ button ] === 'function' ) content[ button ]();
		else content[ 'tier' ]();
	});

	content[ 'tier' ]();
});

function createList (){
	let itemList = [];
	$( '.selected' ).each( function(){
		let keys = Object.keys( dataSet[ currentTier ][ $( this ).attr( 'data-value' ) ] );
		for ( let index = 0; index < keys.length; index++ ){
			let insert = dataSet[ currentTier ][ $( this ).attr( 'data-value' ) ][ keys[ index ] ];
			insert.name = keys[ index ];
			itemList.push( insert );
		}
	});
	itemList.sort( function( a, b ){
		let aValue = null;
		let bValue = null;
		if ( settings.sortByValue === true ){
			aValue = ( settings.sortByCrafted === true && typeof a.craftedValue === 'number' ? a.craftedValue : a.value );
			bValue = ( settings.sortByCrafted === true && typeof b.craftedValue === 'number' ? b.craftedValue : b.value );
			if ( aValue < bValue ) return 1;
			if ( aValue > bValue ) return -1;
		}
		aValue = a.name.toLowerCase();
		bValue = b.name.toLowerCase();
		if ( aValue > bValue ) return 1;
		if ( aValue < bValue ) return -1;
		return 0;
	});

	let html = '<div class="text">Table for ' + currentTier + ': ' + $( '.selected' ).map( function() { return $( this ).attr( 'data-value' ) } ).get().join( ', ' ); + '</div>';
	for ( let index = 0; index < itemList.length; index++ ){
		if ( settings.ignoreLowest !== true || ( settings.sortByCrafted === true && typeof itemList[ index ].craftedValue === 'number' ? itemList[ index ].craftedValue : itemList[ index ].value ) !== dataSet.values[ 0 ] ){
			html += '<div class="itemRow valueStyle' + ( settings.sortByCrafted === true && typeof itemList[ index ].craftedValue === 'number' ? itemList[ index ].craftedValue : itemList[ index ].value ) + ( settings.showVaulted === true && itemList[ index ].vaulted === true ? ' vaulted' : '' ) + '">'
				html += '<div class="itemValue">' + ( typeof itemList[ index ].craftedValue === 'number' ? itemList[ index ].value + ' / ' + itemList[ index ].craftedValue : itemList[ index ].value ) + '</div>';
				html += '<div class="itemName">' + itemList[ index ].name + ( settings.showRarity === true ? ' ( ' + itemList[ index ].rarity + ' )' : '' ) + '</div>';
			html += '</div>';
		}
	}
	html += '<div id="return" class="outline" data-value="' + currentTier + '">Back to ' + currentTier + '</div>';
	$( '#tile' ).html( html );
}