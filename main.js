var selectedBlockIndex = 3;
var gridSize = {
	x: 30,
	y: 15
};

var blockData = [
	{
		id: 0,
		name: 'Air',
		texture: 'block_air.png',
		hardness: -1
	},
	{
		id: 2,
		name: 'Grass',
		texture: 'block_grass.png',
		hardness: 1
	},
	{
		id: 3,
		name: 'Dirt',
		texture: 'block_dirt.png',
		hardness: 1
	},
	{
		id: 5,
		name: 'Oak Wood Plank',
		texture: 'block_plank.png',
		hardness: 2
	},
	{
		id: 7,
		name: 'Bedrock',
		texture: 'block_bedrock.png',
		hardness: -1
	},
	{
		id: 404,
		name: 'Error',
		texture: 'block_404.png',
		hardness: -1
	}
];

var blocks = [];

$(document).ready(function() {
	// Create blocks according to grid
	for(var row = 0; row < gridSize.y; row++) {
		var newRow = $('<tr>');

		for(var col = 0; col < gridSize.x; col++) {
			var theType = 0;

			// Third last row should be grass
			if(row == (gridSize.y - 3)) theType = 2;

			// Second last row should be dirt
			if(row == (gridSize.y - 2)) theType = 3;

			// Last row should be bedrock
			if(row == (gridSize.y - 1)) theType = 7;

			var newBlock = new Block(theType);
			blocks.push(newBlock);

			newRow.append(newBlock.element);
		}

		$('#scene').append(newRow);
	}
});

// Get texture by block ID
function getBlockTexture(id) {
	for(var i = 0; i < blockData.length; i++) {
		if(blockData[i].id == id) return blockData[i].texture;
	}
}

// Get hardness by block ID
function getBlockHardness(id) {
	for(var i = 0; i < blockData.length; i++) {
		if(blockData[i].id == id) return blockData[i].hardness;
	}
}

// Scroll detection
$('html').on('DOMMouseScroll', function(e) {
	var delta = e.originalEvent.detail;
	
	if (delta < 0) {
		setSelectedBlockIndex(selectedBlockIndex + 1);
	} else if (delta > 0) {
		setSelectedBlockIndex(selectedBlockIndex - 1);
	}
});

$('html').on('mousewheel', function(e) {
	var delta = e.originalEvent.wheelDelta;
    
	if (delta < 0) {
		setSelectedBlockIndex(selectedBlockIndex - 1);
	} else if (delta > 0) {
		setSelectedBlockIndex(selectedBlockIndex + 1);
	}
});

function setSelectedBlockIndex(blockIndex) {
	// Selected block too high, wrap to begin
	if(blockIndex > blockData.length-1) {
		selectedBlockIndex = 1;
	}
	else if(blockIndex < 1) { // Selected block too low, wrap to end
		selectedBlockIndex = blockData.length - 1;
	}
	else { // Valid block
		selectedBlockIndex = blockIndex;
	}

	blockIndex = selectedBlockIndex;

	$('#blockIndicator').css('background-image', 'url(img/' + getBlockTexture(blockData[selectedBlockIndex].id) + ')');
}

function isLegalBlock(index) {
	if(blockData[index].hardness == -1) return false;
	else return true;
}

// Block class
function Block(id) {
	this.id = id;
	this.element = $('<td>');

	this.hardness = getBlockHardness(this.id);
	this.breakInterval = null;
	this.breakState = 0;

	// Set proper texture
	this.setType(this.id);

	// Hold down block
	var self = this;
	$(this.element).mousedown( function() {
		self.breakState = 0.1;
		self.holdBlock();
	});

	// Let go of block
	$(this.element).mouseup(function() {
		self.stopHoldBlock();
	});
	$(this.element).mouseleave(function() {
		self.stopHoldBlock();
	});

	// Place block here
	$(this.element).contextmenu(function() {
		if(self.id == 0) self.placeBlock();
		return false;
	});
}

Block.prototype.placeBlock = function() {
	this.setType(blockData[selectedBlockIndex].id);
}

Block.prototype.destroy = function() {
	this.setType(0);
	$(this.element).find('img').remove();
}

Block.prototype.setType = function(id) {
	this.id = id;
	this.hardness = getBlockHardness(this.id);
	$(this.element).css('background-image', 'url(img/' + getBlockTexture(id) + ')');
}

Block.prototype.holdBlock = function() {
	if(this.hardness == -1) return 1;
	var self = this;

	this.breakInterval = setInterval(function() {
		self.addBreakState();
	}, self.hardness * 100);
}

Block.prototype.addBreakState = function() {
	this.breakState = Math.round(this.breakState + 1);

	if($(this.element).find('img').length) $(this.element).find('img').remove();

	// Done breaking
	if(this.breakState >= 10) {
		this.destroy();
		this.stopHoldBlock();
	}
	else {
		// Create new break texture
		if(!$(this.element).find('img').length) {
			var breakImg = $('<img>');
			breakImg.attr('src', 'img/break_' + this.breakState + '.png');
			$(this.element).append(breakImg);
		}
		else { // Update texture
			$(this.element).find('img').attr('src', 'img/break_' + this.breakState + '.png');
		}
	}
}

Block.prototype.stopHoldBlock = function() {
	if(this.breakState != 0) {
		$(this.element).find('img').remove();
		this.breakState = 0;
		clearInterval(this.breakInterval);
	}
}