'use strict';

var settings = {
	'sortByCrafted': true,
	'sortByName': true,
	'ignoreLowest': false,
	'showRarity': false,
	'showVaulted': true
};

var defaultColours = [ 'lavender', 'paleturquoise', 'lightcyan', 'mintcream', 'papayawhip', 'mistyrose', 'pink' ];
var valueStyles = '<style type="text/css">';
for ( let index = 0; index < dataSet.values.length; index++ ){
	valueStyles += '.valueStyle' + dataSet.values[ index ] + '{ background-color:' + ( index < defaultColours.length ? defaultColours[ index ] : 'palegoldenrod' ) + ';}';
}
valueStyles += '</style>';
$( valueStyles ).appendTo("head");

var content = {
	'tier': '<div class="text">Select a tier to begin:</div><div class="tier outline" data-value="Lith">LITH</div><div class="tier outline" data-value="Meso">MESO</div><div class="tier outline" data-value="Neo">NEO</div><div class="tier outline" data-value="Axi">AXI</div><div class="navButton outline" data-value="vaulted">Vaulted</div>',
	'info': '<div class="text">Contact</div><div class="text">Data source</div><div class="text">Data last updated: ' + new Date( dataSet.buildDate ).toISOString() + '</div><div class="text">Legal</div><div class="text">Planned Features</div><div class="text">Known Bugs</div>',
	'settings': '<div class="options"><div class="text">Settings:</div><div class="option outline' + ( settings.sortByCrafted === true ? ' active' : '' ) + '" data-value="sortByCrafted">Sort by crafted price</div><div class="nyi option outline' + ( settings.sortByName === true ? ' active' : '' ) + '" data-value="sortByName">Sort by name</div><div class="nyi option outline' + ( settings.ignoreLowest === true ? ' active' : '' ) + '" data-value="ignoreLowest">Ignore lowest value items</div><div class="nyi option outline' + ( settings.showRarity === true ? ' active' : '' ) + '" data-value="showRarity">Indicate rarity</div><div class="nyi option outline' + ( settings.showVaulted === true ? ' active' : '' ) + '" data-value="showVaulted">Indicate vaulted status</div></div>',
	'vaulted': '<div class="text">Vaulted Relic List:</div><div class="text">Lith M1</div><div class="text">Meso B1</div><div class="text">Neo D1</div><div class="text">Axi V2</div></div>'
};

var currentTier = null;

$( document ).ready( function(){
	$( '#tile' ).on( 'click', '.tier', function( event ){
		event.preventDefault();
		currentTier = $( this ).attr( 'data-value' );
		let list = Object.keys( dataSet[ currentTier ] ).sort();
		let html = '<div class="text">Select 4 relics or fewer and the go button to get a listing:</div>';
		for ( let index = 0; index < list.length; index++ ) html += '<div class="relic outline" data-value="' + list[ index ] + '">' + list[ index ] + '</div>';
		html += '<div class="tableRow"><div id="go" class="go outline">Go</div><div id="all" class="go outline">All</div></div>';
		$( '#tile' ).html( html );
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
	});

	$( 'body' ).on( 'click', '.navButton', function( event ){
		event.preventDefault();
		let button = $( this ).attr( 'data-value' );
		if ( button === 'info' ) staticTile( 'info' );
		if ( button === 'back' ) staticTile( 'tier' );
		if ( button === 'settings' ) staticTile( 'settings' );
		if ( button === 'vaulted' ) staticTile( 'vaulted' );
	});

	staticTile( 'tier' );
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
		let aValue = ( settings.sortByCrafted === true && typeof a.craftedValue === 'number' ? a.craftedValue : a.value );
		let bValue = ( settings.sortByCrafted === true && typeof b.craftedValue === 'number' ? b.craftedValue : b.value );
		if ( aValue < bValue ) return 1;
		if ( aValue > bValue ) return -1;
		aValue = a.name.toLowerCase();
		bValue = b.name.toLowerCase();
		if ( aValue > bValue ) return 1;
		if ( aValue < bValue ) return -1;
		return 0;
	});

	let html = '<div class="text">Table for ' + $( '.selected' ).map( function() { return $( this ).attr( 'data-value' ) } ).get().join( ', ' ); + '</div>';
	for ( let index = 0; index < itemList.length; index++ )	html += '<div class="itemRow valueStyle' + ( typeof itemList[ index ].craftedValue === 'number' ? itemList[ index ].craftedValue : itemList[ index ].value ) + ( itemList[ index ].vaulted === true ? ' vaulted' : '' ) + '"><div class="itemValue">' + ( typeof itemList[ index ].craftedValue === 'number' ? itemList[ index ].value + ' / ' + itemList[ index ].craftedValue : itemList[ index ].value ) + '</div><div class="itemName">' + itemList[ index ].name + '</div></div>';
	$( '#tile' ).html( html );
}

function staticTile( page ){
	$( '#tile' ).html( content[ page ] );
	currentTier = null;
}