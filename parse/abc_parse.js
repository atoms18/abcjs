//    abc_parse.js: parses a string representing ABC Music Notation into a usable internal structure.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global window */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.parse)
	window.ABCJS.parse = {};

window.ABCJS.parse.Parse = function() {
	"use strict";
	var tune = new window.ABCJS.data.Tune();
	var tokenizer = new window.ABCJS.parse.tokenizer();

	this.getTune = function() {
		return tune;
	};

	//[HarmonyChecker] Parallel
	var soprano = [];
	var alto = [];
	var tenor = [];
	var bass = [];
	
	var sharpKeys = ["C","G","D","A","E","B","F#","C#"];
	var flatKeys = ['Bb','Eb','Ab','Db','Gb','Cb','Fb'];
	
	var sharps = [3,0,4,1,5,2,6];
	var flats = [6,2,5,1,4,0,3];
	
	var harmoChordPre = [];
	var harmoIndexPre;
	var linePre;
	var conChord = 0;
	
	var toReadableNote = function(numNote) {
		
		var note = numNote %12;
		if(note < 0){
			note = note + 12;
		}
		
		var key = tune.lines[0].staff[0].key.root + tune.lines[0].staff[0].key.acc;
		
		if(sharpKeys.indexOf(key) > -1){
			switch(note){
			case 0: return "C";
			case 1: return "C#";
			case 2: return "D";
			case 3: return "D#";
			case 4: return "E";
			case 5: return "F";
			case 6: return "F#";
			case 7: return "G";
			case 8: return "G#";
			case 9: return "A";
			case 10: return "A#";
			case 11: return "B";
			default: break;
			}
		}else if(flatKeys.indexOf(key) > -1){
			switch(note){
			case 0: return "C";
			case 1: return "Db";
			case 2: return "D";
			case 3: return "Eb";
			case 4: return "E";
			case 5: return "F";
			case 6: return "Gb";
			case 7: return "G";
			case 8: return "Ab";
			case 9: return "A";
			case 10: return "Bb";
			case 11: return "B";
			default: break;
			}
		}
		
		
	}
	
	var noteNum = function(inNote,accidental) {
		var noteConverted;
		
		switch(inNote) {
			case -14: noteConverted = -24; break;
			case -13: noteConverted = -22; break;
			case -12: noteConverted = -20; break;
			case -11: noteConverted = -19; break;
			case -10: noteConverted = -17; break;
			case -9: noteConverted = -15; break; 
			case -8: noteConverted = -13; break;
			
			case -7: noteConverted = -12; break;
			case -6: noteConverted = -10; break;
			case -5: noteConverted = -8; break;
			case -4: noteConverted = -7; break;
			case -3: noteConverted = -5; break;
			case -2: noteConverted = -3; break;
			case -1: noteConverted = -1; break;
			
			case 0: noteConverted = 0; break;//Middle C
			case 1: noteConverted = 2; break;
			case 2: noteConverted = 4; break;
			case 3: noteConverted = 5; break;
			case 4: noteConverted = 7; break;
			case 5: noteConverted = 9; break;
			case 6: noteConverted = 11; break;
			
			case 7: noteConverted = 12; break;
			case 8: noteConverted = 14; break;
			case 9: noteConverted = 16; break;
			case 10: noteConverted = 17; break;
			case 11: noteConverted = 19; break;
			case 12: noteConverted = 21; break;
			case 13: noteConverted = 23; break;
			
			case 14: noteConverted = 24; break;
			
			default: break;
		}
		
		if(accidental != null){
			switch(accidental) {
			case "dblflat": noteConverted = noteConverted - 2; break; //DoubleFlat
			case "flat": noteConverted--; break; //Flat
			case "natural": break;
			case "sharp": noteConverted++; break; //Sharp
			case "dblsharp": noteConverted = noteConverted + 2; break; //DoubleSharp
			default: break;
			}
		}else{
			var key = tune.lines[0].staff[0].key.root + tune.lines[0].staff[0].key.acc;
			var centeredNote = inNote %7;
			if(centeredNote < 0){
				centeredNote = centeredNote+12;
			}
				if(sharpKeys.indexOf(key) > -1){
					for (var i = 0; i < keyAccidentals(key); i++) {
						if(centeredNote == sharps[i]){
							noteConverted++;
							break;
						}
					}
				}else if(flatKeys.indexOf(key) > -1){
					for (var i = 0; i < keyAccidentals(key); i++) {
						if(centeredNote == flats[i]){
							noteConverted--;
							break;
						}
					}
				}
		}
		return noteConverted;
	}
	
	var keyAccidentals = function(keySignature) {
		switch(keySignature) {
			case "G": return 1; //Sharp
			case "D": return 2;
			case "A": return 3;
			case "E": return 4;
			case "B": return 5;
			case "F#": return 6;
			case "C#": return 7;
			
			case "Bb": return 1; //Flat
			case "Eb": return 2;
			case "Ab": return 3;
			case "Db": return 4;
			case "Gb": return 5;
			case "Cb": return 6;
			case "Fb": return 7;
			
			default: return 0;
		}
	}
	//end Parallel
	
	function addPositioning(el, type, value) {
		if (!el.positioning) el.positioning = {};
		el.positioning[type] = value;
	}

	function addFont(el, type, value) {
		if (!el.fonts) el.fonts = {};
		el.fonts[type] = value;
	}

	var multilineVars = {
		reset: function() {
			for (var property in this) {
				if (this.hasOwnProperty(property) && typeof this[property] !== "function") {
					delete this[property];
				}
			}
			this.iChar = 0;
			this.key = {accidentals: [], root: 'none', acc: '', mode: '' };
			this.meter = {type: 'specified', value: [{num: '4', den: '4'}]};	// if no meter is specified, there is an implied one.
			this.origMeter = {type: 'specified', value: [{num: '4', den: '4'}]};	// this is for new voices that are created after we set the meter.
			this.hasMainTitle = false;
			this.default_length = 0.125;
			this.clef = { type: 'treble', verticalPos: 0 };
			this.next_note_duration = 0;
			this.start_new_line = true;
			this.is_in_header = true;
			this.is_in_history = false;
			this.partForNextLine = "";
			this.havent_set_length = true;
			this.voices = {};
			this.staves = [];
			this.macros = {};
			this.currBarNumber = 1;
			this.inTextBlock = false;
			this.inPsBlock = false;
			this.ignoredDecorations = [];
			this.textBlock = "";
			this.score_is_present = false;	// Can't have original V: lines when there is the score directive
			this.inEnding = false;
			this.inTie = false;
			this.inTieChord = {};
			this.vocalPosition = "auto";
			this.dynamicPosition = "auto";
			this.chordPosition = "auto";
			this.ornamentPosition = "auto";
			this.volumePosition = "auto";
			this.openSlurs = [];
			this.openDangers = [];
		},
		differentFont: function(type, defaultFonts) {
			if (this[type].decoration !== defaultFonts[type].decoration) return true;
			if (this[type].face !== defaultFonts[type].face) return true;
			if (this[type].size !== defaultFonts[type].size) return true;
			if (this[type].style !== defaultFonts[type].style) return true;
			if (this[type].weight !== defaultFonts[type].weight) return true;
			return false;
		},
		addFormattingOptions: function(el, defaultFonts, elType) {
			if (elType === 'note') {
				if (this.vocalPosition !== 'auto') addPositioning(el, 'vocalPosition', this.vocalPosition);
				if (this.dynamicPosition !== 'auto') addPositioning(el, 'dynamicPosition', this.dynamicPosition);
				if (this.chordPosition !== 'auto') addPositioning(el, 'chordPosition', this.chordPosition);
				if (this.ornamentPosition !== 'auto') addPositioning(el, 'ornamentPosition', this.ornamentPosition);
				if (this.volumePosition !== 'auto') addPositioning(el, 'volumePosition', this.volumePosition);
				if (this.differentFont("annotationfont", defaultFonts)) addFont(el, 'annotationfont', this.annotationfont);
				if (this.differentFont("gchordfont", defaultFonts)) addFont(el, 'gchordfont', this.gchordfont);
				if (this.differentFont("vocalfont", defaultFonts)) addFont(el, 'vocalfont', this.vocalfont);
			} else if (elType === 'bar') {
				if (this.dynamicPosition !== 'auto') addPositioning(el, 'dynamicPosition', this.dynamicPosition);
				if (this.chordPosition !== 'auto') addPositioning(el, 'chordPosition', this.chordPosition);
				if (this.ornamentPosition !== 'auto') addPositioning(el, 'ornamentPosition', this.ornamentPosition);
				if (this.volumePosition !== 'auto') addPositioning(el, 'volumePosition', this.volumePosition);
				if (this.differentFont("measurefont", defaultFonts)) addFont(el, 'measurefont', this.measurefont);
				if (this.differentFont("repeatfont", defaultFonts)) addFont(el, 'repeatfont', this.repeatfont);
			}
		}
	};

	var addWarning = function(str) {
		if (!multilineVars.warnings)
			multilineVars.warnings = [];
		multilineVars.warnings.push(str);
	};

	var encode = function(str) {
		var ret = window.ABCJS.parse.gsub(str, '\x12', ' ');
		ret = window.ABCJS.parse.gsub(ret, '&', '&amp;');
		ret = window.ABCJS.parse.gsub(ret, '<', '&lt;');
		return window.ABCJS.parse.gsub(ret, '>', '&gt;');
	};

	var warn = function(str, line, col_num) {
		if (!line) line = " ";
		var bad_char = line.charAt(col_num);
		if (bad_char === ' ')
			bad_char = "SPACE";
		var clean_line = encode(line.substring(0, col_num)) +
			'<span style="text-decoration:underline;font-size:1.3em;font-weight:bold;">' + bad_char + '</span>' +
			encode(line.substring(col_num+1));
		addWarning("Music Line:" + tune.getNumLines() + ":" + (col_num+1) + ': ' + str + ":  " + clean_line);
	};
	
	var warnChord = function(str, line, col_num, chd, chd2) {
		var bad_chord = chd.join('') + chd2.join('');
		var clean_line = 
			'<span style="text-decoration:underline;font-size:1.3em;font-weight:bold;">' + bad_chord + '</span>';
		addWarning("Music Line:" + line + ":" + (col_num+1) + ': ' + str + ":  " + clean_line);
	};
	
	var header = new window.ABCJS.parse.ParseHeader(tokenizer, warn, multilineVars, tune);

	this.getWarnings = function() {
		return multilineVars.warnings;
	};

	var letter_to_chord = function(line, i)
	{
		if (line.charAt(i) === '"')
		{
			var chord = tokenizer.getBrackettedSubstring(line, i, 5);
			if (!chord[2])
				warn("Missing the closing quote while parsing the chord symbol", line , i);
			// If it starts with ^, then the chord appears above.
			// If it starts with _ then the chord appears below.
			// (note that the 2.0 draft standard defines them as not chords, but annotations and also defines @.)
			if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '^') {
				chord[1] = chord[1].substring(1);
				chord[2] = 'above';
			} else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '_') {
				chord[1] = chord[1].substring(1);
				chord[2] = 'below';
			} else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '<') {
				chord[1] = chord[1].substring(1);
				chord[2] = 'left';
			} else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '>') {
				chord[1] = chord[1].substring(1);
				chord[2] = 'right';
			} else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '@') {
				// @-15,5.7
				chord[1] = chord[1].substring(1);
				var x = tokenizer.getFloat(chord[1]);
				if (x.digits === 0)
					warn("Missing first position in absolutely positioned annotation.", line , i);
				chord[1] = chord[1].substring(x.digits);
				if (chord[1][0] !== ',')
					warn("Missing comma absolutely positioned annotation.", line , i);
				chord[1] = chord[1].substring(1);
				var y = tokenizer.getFloat(chord[1]);
				if (y.digits === 0)
					warn("Missing second position in absolutely positioned annotation.", line , i);
				chord[1] = chord[1].substring(y.digits);
				var ws = tokenizer.skipWhiteSpace(chord[1]);
				chord[1] = chord[1].substring(ws);
				chord[2] = null;
				chord[3] = { x: x.value, y: y.value };
			} else {
				chord[1] = chord[1].replace(/([ABCDEFG])b/g, "$1♭");
				chord[1] = chord[1].replace(/([ABCDEFG])#/g, "$1♯");
				chord[2] = 'default';
			}
			return chord;
		}
		return [0, ""];
	};

	var legalAccents = [ "trill", "lowermordent", "uppermordent", "mordent", "pralltriller", "accent",
		"fermata", "invertedfermata", "tenuto", "0", "1", "2", "3", "4", "5", "+", "wedge",
		"open", "thumb", "snap", "turn", "roll", "breath", "shortphrase", "mediumphrase", "longphrase",
		"segno", "coda", "D.S.", "D.C.", "fine",
		"slide", "^", "marcato",
		"upbow", "downbow", "/", "//", "///", "////", "trem1", "trem2", "trem3", "trem4",
		"turnx", "invertedturn", "invertedturnx", "trill(", "trill)", "arpeggio", "xstem", "mark", "umarcato",
		"style=normal", "style=harmonic", "style=rhythm", "style=x"
	];
	var volumeDecorations = [ "p", "pp", "f", "ff", "mf", "mp", "ppp", "pppp",  "fff", "ffff", "sfz" ];
	var dynamicDecorations = ["crescendo(", "crescendo)", "diminuendo(", "diminuendo)"];

	var accentPseudonyms = [ ["<", "accent"], [">", "accent"], ["tr", "trill"],
		["plus", "+"], [ "emphasis", "accent"],
		[ "^", "umarcato" ], [ "marcato", "umarcato" ] ];
	var accentDynamicPseudonyms = [ ["<(", "crescendo("], ["<)", "crescendo)"],
		[">(", "diminuendo("], [">)", "diminuendo)"] ];
	var letter_to_accent = function(line, i)
	{
		var macro = multilineVars.macros[line.charAt(i)];

		if (macro !== undefined) {
			if (macro.charAt(0) === '!' || macro.charAt(0) === '+')
				macro = macro.substring(1);
			if (macro.charAt(macro.length-1) === '!' || macro.charAt(macro.length-1) === '+')
				macro = macro.substring(0, macro.length-1);
			if (window.ABCJS.parse.detect(legalAccents, function(acc) {
					return (macro === acc);
				}))
				return [ 1, macro ];
			else if (window.ABCJS.parse.detect(volumeDecorations, function(acc) {
					return (macro === acc);
				})) {
				if (multilineVars.volumePosition === 'hidden')
					macro = "";
				return [1, macro];
			} else if (window.ABCJS.parse.detect(dynamicDecorations, function(acc) {
					if (multilineVars.dynamicPosition === 'hidden')
						macro = "";
					return (macro === acc);
				})) {
				return [1, macro];
			} else {
				if (!window.ABCJS.parse.detect(multilineVars.ignoredDecorations, function(dec) {
					return (macro === dec);
				}))
					warn("Unknown macro: " + macro, line, i);
				return [1, '' ];
			}
		}
		switch (line.charAt(i))
		{
			case '.':return [1, 'staccato'];
			case 'u':return [1, 'upbow'];
			case 'v':return [1, 'downbow'];
			case '~':return [1, 'irishroll'];
			case '!':
			case '+':
				var ret = tokenizer.getBrackettedSubstring(line, i, 5);
				// Be sure that the accent is recognizable.
			if (ret[1].length > 0 && (ret[1].charAt(0) === '^' || ret[1].charAt(0) ==='_'))
					ret[1] = ret[1].substring(1);	// TODO-PER: The test files have indicators forcing the ornament to the top or bottom, but that isn't in the standard. We'll just ignore them.
				if (window.ABCJS.parse.detect(legalAccents, function(acc) {
					return (ret[1] === acc);
				}))
					return ret;
				if (window.ABCJS.parse.detect(volumeDecorations, function(acc) {
						return (ret[1] === acc);
					})) {
					if (multilineVars.volumePosition === 'hidden' )
						ret[1] = '';
						return ret;
				}
				if (window.ABCJS.parse.detect(dynamicDecorations, function(acc) {
						return (ret[1] === acc);
					})) {
					if (multilineVars.dynamicPosition === 'hidden' )
						ret[1] = '';
						return ret;
				}

				if (window.ABCJS.parse.detect(accentPseudonyms, function(acc) {
					if (ret[1] === acc[0]) {
						ret[1] = acc[1];
						return true;
					} else
						return false;
				}))
					return ret;

				if (window.ABCJS.parse.detect(accentDynamicPseudonyms, function(acc) {
					if (ret[1] === acc[0]) {
						ret[1] = acc[1];
						return true;
					} else
						return false;
				})) {
					if (multilineVars.dynamicPosition === 'hidden' )
						ret[1] = '';
						return ret;
				}
				// We didn't find the accent in the list, so consume the space, but don't return an accent.
				// Although it is possible that ! was used as a line break, so accept that.
			if (line.charAt(i) === '!' && (ret[0] === 1 || line.charAt(i+ret[0]-1) !== '!'))
					return [1, null ];
				warn("Unknown decoration: " + ret[1], line, i);
				ret[1] = "";
				return ret;
			case 'H':return [1, 'fermata'];
			case 'J':return [1, 'slide'];
			case 'L':return [1, 'accent'];
			case 'M':return [1, 'mordent'];
			case 'O':return[1, 'coda'];
			case 'P':return[1, 'pralltriller'];
			case 'R':return [1, 'roll'];
			case 'S':return [1, 'segno'];
			case 'T':return [1, 'trill'];
		}
		return [0, 0];
	};

	var letter_to_spacer = function(line, i)
	{
		var start = i;
		while (tokenizer.isWhiteSpace(line.charAt(i)))
			i++;
		return [ i-start ];
	};

	// returns the class of the bar line
	// the number of the repeat
	// and the number of characters used up
	// if 0 is returned, then the next element was not a bar line
	var letter_to_bar = function(line, curr_pos)
	{
		var ret = tokenizer.getBarLine(line, curr_pos);
		if (ret.len === 0)
			return [0,""];
		if (ret.warn) {
			warn(ret.warn, line, curr_pos);
			return [ret.len,""];
		}

		// Now see if this is a repeated ending
		// A repeated ending is all of the characters 1,2,3,4,5,6,7,8,9,0,-, and comma
		// It can also optionally start with '[', which is ignored.
		// Also, it can have white space before the '['.
		for (var ws = 0; ws < line.length; ws++)
			if (line.charAt(curr_pos + ret.len + ws) !== ' ')
				break;
		var orig_bar_len = ret.len;
		if (line.charAt(curr_pos+ret.len+ws) === '[') {
			ret.len += ws + 1;
		}

		// It can also be a quoted string. It is unclear whether that construct requires '[', but it seems like it would. otherwise it would be confused with a regular chord.
		if (line.charAt(curr_pos+ret.len) === '"' && line.charAt(curr_pos+ret.len-1) === '[') {
			var ending = tokenizer.getBrackettedSubstring(line, curr_pos+ret.len, 5);
			return [ret.len+ending[0], ret.token, ending[1]];
		}
		var retRep = tokenizer.getTokenOf(line.substring(curr_pos+ret.len), "1234567890-,");
		if (retRep.len === 0 || retRep.token[0] === '-')
			return [orig_bar_len, ret.token];

		return [ret.len+retRep.len, ret.token, retRep.token];
	};

	var letter_to_open_slurs_and_triplets =  function(line, i) {
		// consume spaces, and look for all the open parens. If there is a number after the open paren,
		// that is a triplet. Otherwise that is a slur. Collect all the slurs and the first triplet.
		var ret = {};
		var start = i;
		while (line.charAt(i) === '(' || tokenizer.isWhiteSpace(line.charAt(i))) {
			if (line.charAt(i) === '(') {
				if (i+1 < line.length && (line.charAt(i+1) >= '2' && line.charAt(i+1) <= '9')) {
					if (ret.triplet !== undefined)
						warn("Can't nest triplets", line, i);
					else {
						ret.triplet = line.charAt(i+1) - '0';
						if (i+2 < line.length && line.charAt(i+2) === ':') {
							// We are expecting "(p:q:r" or "(p:q" or "(p::r" we are only interested in the first number (p) and the number of notes (r)
							// if r is missing, then it is equal to p.
							if (i+3 < line.length && line.charAt(i+3) === ':') {
								if (i+4 < line.length && (line.charAt(i+4) >= '1' && line.charAt(i+4) <= '9')) {
									ret.num_notes = line.charAt(i+4) - '0';
									i += 3;
								} else
									warn("expected number after the two colons after the triplet to mark the duration", line, i);
							} else if (i+3 < line.length && (line.charAt(i+3) >= '1' && line.charAt(i+3) <= '9')) {
								// ignore this middle number
								if (i+4 < line.length && line.charAt(i+4) === ':') {
									if (i+5 < line.length && (line.charAt(i+5) >= '1' && line.charAt(i+5) <= '9')) {
										ret.num_notes = line.charAt(i+5) - '0';
										i += 4;
									}
								} else {
									ret.num_notes = ret.triplet;
									i += 3;
								}
							} else
								warn("expected number after the triplet to mark the duration", line, i);
						}
					}
					i++;
				}
				else {
					if (ret.startSlur === undefined)
						ret.startSlur = 1;
					else
						ret.startSlur++;
				}
			}
			i++;
		}
		ret.consumed = i-start;
		return ret;
	};
	
	var letter_to_open_danger =  function(line, i) {
		// consume spaces, and look for all the open parens. If there is a number after the open paren,
		// that is a triplet. Otherwise that is a slur. Collect all the slurs and the first triplet.
		var ret = {};
		var start = i;
		while (line.charAt(i) === '/' || tokenizer.isWhiteSpace(line.charAt(i))) {
			if (line.charAt(i) === '/') {
				if (ret.startDanger === undefined)
						ret.startDanger = 1;
					else
						ret.startDanger++;
			}
			i++;
		}
		ret.consumed = i-start;
		return ret;
	};

	var addWords = function(line, words) {
		if (!line) { warn("Can't add words before the first line of music", line, 0); return; }
		words = window.ABCJS.parse.strip(words);
		if (words.charAt(words.length-1) !== '-')
			words = words + ' ';	// Just makes it easier to parse below, since every word has a divider after it.
		var word_list = [];
		// first make a list of words from the string we are passed. A word is divided on either a space or dash.
		var last_divider = 0;
		var replace = false;
		var addWord = function(i) {
			var word = window.ABCJS.parse.strip(words.substring(last_divider, i));
			last_divider = i+1;
			if (word.length > 0) {
				if (replace)
					word = window.ABCJS.parse.gsub(word,'~', ' ');
				var div = words.charAt(i);
				if (div !== '_' && div !== '-')
					div = ' ';
				word_list.push({syllable: tokenizer.translateString(word), divider: div});
				replace = false;
				return true;
			}
			return false;
		};
		for (var i = 0; i < words.length; i++) {
			switch (words.charAt(i)) {
				case ' ':
				case '\x12':
					addWord(i);
					break;
				case '-':
					if (!addWord(i) && word_list.length > 0) {
						window.ABCJS.parse.last(word_list).divider = '-';
						word_list.push({skip: true, to: 'next'});
					}
					break;
				case '_':
					addWord(i);
					word_list.push({skip: true, to: 'slur'});
					break;
				case '*':
					addWord(i);
					word_list.push({skip: true, to: 'next'});
					break;
				case '|':
					addWord(i);
					word_list.push({skip: true, to: 'bar'});
					break;
				case '~':
					replace = true;
					break;
			}
		}

		var inSlur = false;
		window.ABCJS.parse.each(line, function(el) {
			if (word_list.length !== 0) {
				if (word_list[0].skip) {
					switch (word_list[0].to) {
						case 'next': if (el.el_type === 'note' && el.pitches !== null && !inSlur) word_list.shift(); break;
						case 'slur': if (el.el_type === 'note' && el.pitches !== null) word_list.shift(); break;
						case 'bar': if (el.el_type === 'bar') word_list.shift(); break;
					}
				} else {
					if (el.el_type === 'note' && el.rest === undefined && !inSlur) {
						var lyric = word_list.shift();
						if (el.lyric === undefined)
							el.lyric = [ lyric ];
						else
							el.lyric.push(lyric);
					}
				}
			}
		});
	};

	var addSymbols = function(line, words) {
		// TODO-PER: Currently copied from w: line. This needs to be read as symbols instead.
		if (!line) { warn("Can't add symbols before the first line of music", line, 0); return; }
		words = window.ABCJS.parse.strip(words);
		if (words.charAt(words.length-1) !== '-')
			words = words + ' ';	// Just makes it easier to parse below, since every word has a divider after it.
		var word_list = [];
		// first make a list of words from the string we are passed. A word is divided on either a space or dash.
		var last_divider = 0;
		var replace = false;
		var addWord = function(i) {
			var word = window.ABCJS.parse.strip(words.substring(last_divider, i));
			last_divider = i+1;
			if (word.length > 0) {
				if (replace)
					word = window.ABCJS.parse.gsub(word, '~', ' ');
				var div = words.charAt(i);
				if (div !== '_' && div !== '-')
					div = ' ';
				word_list.push({syllable: tokenizer.translateString(word), divider: div});
				replace = false;
				return true;
			}
			return false;
		};
		for (var i = 0; i < words.length; i++) {
			switch (words.charAt(i)) {
				case ' ':
				case '\x12':
					addWord(i);
					break;
				case '-':
					if (!addWord(i) && word_list.length > 0) {
						window.ABCJS.parse.last(word_list).divider = '-';
						word_list.push({skip: true, to: 'next'});
					}
					break;
				case '_':
					addWord(i);
					word_list.push({skip: true, to: 'slur'});
					break;
				case '*':
					addWord(i);
					word_list.push({skip: true, to: 'next'});
					break;
				case '|':
					addWord(i);
					word_list.push({skip: true, to: 'bar'});
					break;
				case '~':
					replace = true;
					break;
			}
		}

		var inSlur = false;
		window.ABCJS.parse.each(line, function(el) {
			if (word_list.length !== 0) {
				if (word_list[0].skip) {
					switch (word_list[0].to) {
						case 'next': if (el.el_type === 'note' && el.pitches !== null && !inSlur) word_list.shift(); break;
						case 'slur': if (el.el_type === 'note' && el.pitches !== null) word_list.shift(); break;
						case 'bar': if (el.el_type === 'bar') word_list.shift(); break;
					}
				} else {
					if (el.el_type === 'note' && el.rest === undefined && !inSlur) {
						var lyric = word_list.shift();
						if (el.lyric === undefined)
							el.lyric = [ lyric ];
						else
							el.lyric.push(lyric);
					}
				}
			}
		});
	};

	var getBrokenRhythm = function(line, index) {
		switch (line.charAt(index)) {
			case '>':
			if (index < line.length - 1 && line.charAt(index+1) === '>')	// double >>
					return [2, 1.75, 0.25];
				else
					return [1, 1.5, 0.5];
				break;
			case '<':
			if (index < line.length - 1 && line.charAt(index+1) === '<')	// double <<
					return [2, 0.25, 1.75];
				else
					return [1, 0.5, 1.5];
				break;
		}
		return null;
	};

	// TODO-PER: make this a method in el.
	var addEndBeam = function(el) {
		if (el.duration !== undefined && el.duration < 0.25)
			el.end_beam = true;
		return el;
	};

	var pitches = {A: 5, B: 6, C: 0, D: 1, E: 2, F: 3, G: 4, a: 12, b: 13, c: 7, d: 8, e: 9, f: 10, g: 11};
	var rests = {x: 'invisible', y: 'spacer', z: 'rest', Z: 'multimeasure' };
	var getCoreNote = function(line, index, el, canHaveBrokenRhythm) {
		//var el = { startChar: index };
		var isComplete = function(state) {
			return (state == 'startDanger' || state === 'octave' || state === 'duration' || state === 'Zduration' || state === 'broken_rhythm' || state === 'end_slur');
		};
		var state = 'startSlur';
		var durationSetByPreviousNote = false;
		while (1) {
			switch(line.charAt(index)) {
				case '(':
					if (state === 'startSlur') {
						if (el.startSlur === undefined) el.startSlur = 1; else el.startSlur++;
					} else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case ')':
					if (isComplete(state)) {
						if (el.endSlur === undefined) el.endSlur = 1; else el.endSlur++;
					} else return null;
					break;
					
				case '/':
					if (state === 'startSlur') {
						state = 'startDanger';
						if (el.startDanger === undefined) el.startDanger = 1; else el.startDanger++;
					} else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case '\\':
					if (isComplete(state)) {
						if (el.endDanger === undefined) el.endDanger = 1; else el.endDanger++;
					} else return null;
					break;
					
				case '^':
					if (state === 'startSlur') {el.accidental = 'sharp';state = 'sharp2';}
					else if (state === 'sharp2') {el.accidental = 'dblsharp';state = 'pitch';}
					else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case '_':
					if (state === 'startSlur') {el.accidental = 'flat';state = 'flat2';}
					else if (state === 'flat2') {el.accidental = 'dblflat';state = 'pitch';}
					else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case '=':
					if (state === 'startSlur') {el.accidental = 'natural';state = 'pitch';}
					else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case 'A':
				case 'B':
				case 'C':
				case 'D':
				case 'E':
				case 'F':
				case 'G':
				case 'a':
				case 'b':
				case 'c':
				case 'd':
				case 'e':
				case 'f':
				case 'g':
					if (state === 'startDanger' || state === 'startSlur' || state === 'sharp2' || state === 'flat2' || state === 'pitch') {
						el.pitch = pitches[line.charAt(index)];
						state = 'octave';
						// At this point we have a valid note. The rest is optional. Set the duration in case we don't get one below
						if (canHaveBrokenRhythm && multilineVars.next_note_duration !== 0) {
							el.duration = multilineVars.default_length * multilineVars.next_note_duration;
							multilineVars.next_note_duration = 0;
							durationSetByPreviousNote = true;
						} else
							el.duration = multilineVars.default_length;
					} else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case ',':
					if (state === 'octave') {el.pitch -= 7;}
					else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case '\'':
					if (state === 'octave') {el.pitch += 7;}
					else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case 'x':
				case 'y':
				case 'z':
				case 'Z':
					if (state === 'startSlur' || state === 'startDanger') {
						el.rest = { type: rests[line.charAt(index)] };
						// There shouldn't be some of the properties that notes have. If some sneak in due to bad syntax in the abc file,
						// just nix them here.
						delete el.startDanger;
						delete el.endDanger;
						delete el.accidental;
						delete el.startSlur;
						delete el.startTie;
						delete el.endSlur;
						delete el.endTie;
						delete el.end_beam;
						delete el.grace_notes;
						// At this point we have a valid note. The rest is optional. Set the duration in case we don't get one below
						if (el.rest.type === 'multimeasure') {
							el.duration = 1;
							state = 'Zduration';
						} else {
							if (canHaveBrokenRhythm && multilineVars.next_note_duration !== 0) {
								el.duration = multilineVars.default_length * multilineVars.next_note_duration;
								multilineVars.next_note_duration = 0;
								durationSetByPreviousNote = true;
							} else
								el.duration = multilineVars.default_length;
							state = 'duration';
						}
					} else if (isComplete(state)) {el.endChar = index;return el;}
					else return null;
					break;
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
				case '0':
				case '/':
					if (state === 'octave' || state === 'duration') {
						var fraction = tokenizer.getFraction(line, index);
						//if (!durationSetByPreviousNote)
							el.duration = el.duration * fraction.value;
						// TODO-PER: We can test the returned duration here and give a warning if it isn't the one expected.
						el.endChar = fraction.index;
						while (fraction.index < line.length && (tokenizer.isWhiteSpace(line.charAt(fraction.index)) || line.charAt(fraction.index) === '-')) {
							if (line.charAt(fraction.index) === '-')
								el.startTie = {};
							else
								el = addEndBeam(el);
							fraction.index++;
						}
						index = fraction.index-1;
						state = 'broken_rhythm';
					} else if (state === 'sharp2') {
						el.accidental = 'quartersharp';state = 'pitch';
					} else if (state === 'flat2') {
						el.accidental = 'quarterflat';state = 'pitch';
					} else if (state === 'Zduration') {
						var num = tokenizer.getNumber(line, index);
						el.duration = num.num;
						el.endChar = num.index;
						return el;
					} else return null;
					break;
				case '-':
					if (state === 'startSlur' || state === 'startDanger') {
						// This is the first character, so it must have been meant for the previous note. Correct that here.
						tune.addTieToLastNote();
						el.endTie = true;
					} else if (state === 'octave' || state === 'duration' || state === 'end_slur') {
						el.startTie = {};
						if (!durationSetByPreviousNote && canHaveBrokenRhythm)
							state = 'broken_rhythm';
						else {
							// Peek ahead to the next character. If it is a space, then we have an end beam.
							if (tokenizer.isWhiteSpace(line.charAt(index + 1)))
								addEndBeam(el);
							el.endChar = index+1;
							return el;
						}
					} else if (state === 'broken_rhythm') {el.endChar = index;return el;}
					else return null;
					break;
				case ' ':
				case '\t':
					if (isComplete(state)) {
						el.end_beam = true;
						// look ahead to see if there is a tie
						do {
							if (line.charAt(index) === '-')
								el.startTie = {};
							index++;
						} while (index < line.length && (tokenizer.isWhiteSpace(line.charAt(index)) || line.charAt(index) === '-'));
						el.endChar = index;
						if (!durationSetByPreviousNote && canHaveBrokenRhythm && (line.charAt(index) === '<' || line.charAt(index) === '>')) {	// TODO-PER: Don't need the test for < and >, but that makes the endChar work out for the regression test.
							index--;
							state = 'broken_rhythm';
						} else
							return el;
					}
					else return null;
					break;
				case '>':
				case '<':
					if (isComplete(state)) {
						if (canHaveBrokenRhythm) {
							var br2 = getBrokenRhythm(line, index);
							index += br2[0] - 1;	// index gets incremented below, so we'll let that happen
							multilineVars.next_note_duration = br2[2];
							el.duration = br2[1]*el.duration;
							state = 'end_slur';
						} else {
							el.endChar = index;
							return el;
						}
					} else
						return null;
					break;
				default:
					if (isComplete(state)) {
						el.endChar = index;
						return el;
					}
					return null;
			}
			index++;
			if (index === line.length) {
				if (isComplete(state)) {el.endChar = index;return el;}
				else return null;
			}
		}
		return null;
	};

	function startNewLine() {
		var params = { startChar: -1, endChar: -1};
		if (multilineVars.partForNextLine.length)
			params.part = multilineVars.partForNextLine;
		params.clef = multilineVars.currentVoice && multilineVars.staves[multilineVars.currentVoice.staffNum].clef !== undefined ? window.ABCJS.parse.clone(multilineVars.staves[multilineVars.currentVoice.staffNum].clef) : window.ABCJS.parse.clone(multilineVars.clef) ;
		params.key = window.ABCJS.parse.parseKeyVoice.deepCopyKey(multilineVars.key);
		window.ABCJS.parse.parseKeyVoice.addPosToKey(params.clef, params.key);
		if (multilineVars.meter !== null) {
			if (multilineVars.currentVoice) {
				window.ABCJS.parse.each(multilineVars.staves, function(st) {
					st.meter = multilineVars.meter;
				});
				params.meter = multilineVars.staves[multilineVars.currentVoice.staffNum].meter;
				multilineVars.staves[multilineVars.currentVoice.staffNum].meter = null;
			} else
				params.meter = multilineVars.meter;
			multilineVars.meter = null;
		} else if (multilineVars.currentVoice && multilineVars.staves[multilineVars.currentVoice.staffNum].meter) {
			// Make sure that each voice gets the meter marking.
			params.meter = multilineVars.staves[multilineVars.currentVoice.staffNum].meter;
			multilineVars.staves[multilineVars.currentVoice.staffNum].meter = null;
		}
		if (multilineVars.currentVoice && multilineVars.currentVoice.name)
			params.name = multilineVars.currentVoice.name;
		if (multilineVars.vocalfont)
			params.vocalfont = multilineVars.vocalfont;
		if (multilineVars.style)
			params.style = multilineVars.style;
		if (multilineVars.currentVoice) {
			var staff = multilineVars.staves[multilineVars.currentVoice.staffNum];
			if (staff.brace) params.brace = staff.brace;
			if (staff.bracket) params.bracket = staff.bracket;
			if (staff.connectBarLines) params.connectBarLines = staff.connectBarLines;
			if (staff.name) params.name = staff.name[multilineVars.currentVoice.index];
			if (staff.subname) params.subname = staff.subname[multilineVars.currentVoice.index];
			if (multilineVars.currentVoice.stem)
				params.stem = multilineVars.currentVoice.stem;
			if (multilineVars.currentVoice.scale)
				params.scale = multilineVars.currentVoice.scale;
			if (multilineVars.currentVoice.style)
				params.style = multilineVars.currentVoice.style;
		}
		var isFirstVoice = multilineVars.currentVoice === undefined || (multilineVars.currentVoice.staffNum ===  0 && multilineVars.currentVoice.index ===  0);
		if (multilineVars.barNumbers === 0 && isFirstVoice && multilineVars.currBarNumber !== 1)
			params.barNumber = multilineVars.currBarNumber;
		tune.startNewLine(params);

		multilineVars.partForNextLine = "";
	}

	var letter_to_grace =  function(line, i) {
		// Grace notes are an array of: startslur, note, endslur, space; where note is accidental, pitch, duration
		if (line.charAt(i) === '{') {
			// fetch the gracenotes string and consume that into the array
			var gra = tokenizer.getBrackettedSubstring(line, i, 1, '}');
			if (!gra[2])
				warn("Missing the closing '}' while parsing grace note", line, i);
			// If there is a slur after the grace construction, then move it to the last note inside the grace construction
			if (line[i+gra[0]] === ')') {
				gra[0]++;
				gra[1] += ')';
			}

			var gracenotes = [];
			var ii = 0;
			var inTie = false;
			while (ii < gra[1].length) {
				var acciaccatura = false;
				if (gra[1].charAt(ii) === '/') {
					acciaccatura = true;
					ii++;
				}
				var note = getCoreNote(gra[1], ii, {}, false);
				if (note !== null) {
					// The grace note durations should not be affected by the default length: they should be based on 1/16, so if that isn't the default, then multiply here.
					note.duration = note.duration / (multilineVars.default_length * 8);
					if (acciaccatura)
						note.acciaccatura = true;
					gracenotes.push(note);

					if (inTie) {
						note.endTie = true;
						inTie = false;
					}
					if (note.startTie)
						inTie = true;

					ii  = note.endChar;
					delete note.endChar;
				}
				else {
					// We shouldn't get anything but notes or a space here, so report an error
					if (gra[1].charAt(ii) === ' ') {
						if (gracenotes.length > 0)
							gracenotes[gracenotes.length-1].end_beam = true;
					} else
						warn("Unknown character '" + gra[1].charAt(ii) + "' while parsing grace note", line, i);
					ii++;
				}
			}
			if (gracenotes.length)
				return [gra[0], gracenotes];
		}
		return [ 0 ];
	};

	function durationOfMeasure(multilineVars) {
		// TODO-PER: This could be more complicated if one of the unusual measures is used.
		var meter = multilineVars.origMeter;
		if (!meter || meter.type !== 'specified')
			return 1;
		if (!meter.value || meter.value.length === 0)
			return 1;
		return parseInt(meter.value[0].num, 10) / parseInt(meter.value[0].den, 10);
	}

	//
	// Parse line of music
	//
	// This is a stream of <(bar-marking|header|note-group)...> in any order, with optional spaces between each element
	// core-note is <open-slur, accidental, pitch:required, octave, duration, close-slur&|tie> with no spaces within that
	// chord is <open-bracket:required, core-note:required... close-bracket:required duration> with no spaces within that
	// grace-notes is <open-brace:required, (open-slur|core-note:required|close-slur)..., close-brace:required> spaces are allowed
	// note-group is <grace-notes, chord symbols&|decorations..., grace-notes, slur&|triplet, chord|core-note, end-slur|tie> spaces are allowed between items
	// bar-marking is <ampersand> or <chord symbols&|decorations..., bar:required> spaces allowed
	// header is <open-bracket:required, K|M|L|V:required, colon:required, field:required, close-bracket:required> spaces can occur between the colon, in the field, and before the close bracket
	// header can also be the only thing on a line. This is true even if it is a continuation line. In this case the brackets are not required.
	// a space is a back-tick, a space, or a tab. If it is a back-tick, then there is no end-beam.

	// Line preprocessing: anything after a % is ignored (the double %% should have been taken care of before this)
	// Then, all leading and trailing spaces are ignored.
	// If there was a line continuation, the \n was replaced by a \r and the \ was replaced by a space. This allows the construct
	// of having a header mid-line conceptually, but actually be at the start of the line. This is equivolent to putting the header in [ ].

	// TODO-PER: How to handle ! for line break?
	// TODO-PER: dots before bar, dots before slur
	// TODO-PER: U: redefinable symbols.

	// Ambiguous symbols:
	// "[" can be the start of a chord, the start of a header element or part of a bar line.
	// --- if it is immediately followed by "|", it is a bar line
	// --- if it is immediately followed by K: L: M: V: it is a header (note: there are other headers mentioned in the standard, but I'm not sure how they would be used.)
	// --- otherwise it is the beginning of a chord
	// "(" can be the start of a slur or a triplet
	// --- if it is followed by a number from 2-9, then it is a triplet
	// --- otherwise it is a slur
	// "]"
	// --- if there is a chord open, then this is the close
	// --- if it is after a [|, then it is an invisible bar line
	// --- otherwise, it is par of a bar
	// "." can be a bar modifier or a slur modifier, or a decoration
	// --- if it comes immediately before a bar, it is a bar modifier
	// --- if it comes immediately before a slur, it is a slur modifier
	// --- otherwise it is a decoration for the next note.
	// number:
	// --- if it is after a bar, with no space, it is an ending marker
	// --- if it is after a ( with no space, it is a triplet count
	// --- if it is after a pitch or octave or slash, then it is a duration

	// Unambiguous symbols (except inside quoted strings):
	// vertical-bar, colon: part of a bar
	// ABCDEFGabcdefg: pitch
	// xyzZ: rest
	// comma, prime: octave
	// close-paren: end-slur
	// hyphen: tie
	// tilde, v, u, bang, plus, THLMPSO: decoration
	// carat, underscore, equal: accidental
	// ampersand: time reset
	// open-curly, close-curly: grace notes
	// double-quote: chord symbol
	// less-than, greater-than, slash: duration
	// back-tick, space, tab: space
	var nonDecorations = "ABCDEFGabcdefgxyzZ[]|{";	// use this to prescreen so we don't have to look for a decoration at every note.

	var parseRegularMusicLine = function(line) {
		header.resolveTempo();
		//multilineVars.havent_set_length = false;	// To late to set this now.
		multilineVars.is_in_header = false;	// We should have gotten a key header by now, but just in case, this is definitely out of the header.
		var i = 0;
		var startOfLine = multilineVars.iChar;
		// see if there is nothing but a comment on this line. If so, just ignore it. A full line comment is optional white space followed by %
		while (tokenizer.isWhiteSpace(line.charAt(i)) && i < line.length)
			i++;
		if (i === line.length || line.charAt(i) === '%')
			return;

		// Start with the standard staff, clef and key symbols on each line
		var delayStartNewLine = multilineVars.start_new_line;
		if (multilineVars.continueall === undefined)
			multilineVars.start_new_line = true;
		else
			multilineVars.start_new_line = false;
		var tripletNotesLeft = 0;

		// See if the line starts with a header field
		var retHeader = header.letter_to_body_header(line, i);
		if (retHeader[0] > 0) {
			i += retHeader[0];
			// TODO-PER: Handle inline headers
		}
		var el = { };

		while (i < line.length)
		{
			
			var startI = i;
			if (line.charAt(i) === '%')
				break;
			
			//[HarmonyChecker]
			var hc_voice;

			var retInlineHeader = header.letter_to_inline_header(line, i);
			if (retInlineHeader[0] > 0) {
					i += retInlineHeader[0];
					// TODO-PER: Handle inline headers
					//multilineVars.start_new_line = false;
					
					// [HarmonyChecker] get voice
					if(retInlineHeader[2].startsWith("S")){
						hc_voice = "S";
					}else if(retInlineHeader[2].startsWith("A")){
						hc_voice = "A";
					}else if(retInlineHeader[2].startsWith("T")){
						hc_voice = "T";
					}else if(retInlineHeader[2].startsWith("B")){
						hc_voice = "B";
					}
			} else {
				// Wait until here to actually start the line because we know we're past the inline statements.
				if (delayStartNewLine) {
					startNewLine();
					delayStartNewLine = false;
				}

				// We need to decide if the following characters are a bar-marking or a note-group.
				// Unfortunately, that is ambiguous. Both can contain chord symbols and decorations.
				// If there is a grace note either before or after the chord symbols and decorations, then it is definitely a note-group.
				// If there is a bar marker, it is definitely a bar-marking.
				// If there is either a core-note or chord, it is definitely a note-group.
				// So, loop while we find grace-notes, chords-symbols, or decorations. [It is an error to have more than one grace-note group in a row; the others can be multiple]
				// Then, if there is a grace-note, we know where to go.
				// Else see if we have a chord, core-note, slur, triplet, or bar.

				var ret;
				while (1) {
					ret = tokenizer.eatWhiteSpace(line, i);
					if (ret > 0) {
						i += ret;
					}
					if (i > 0 && line.charAt(i-1) === '\x12') {
						// there is one case where a line continuation isn't the same as being on the same line, and that is if the next character after it is a header.
						ret = header.letter_to_body_header(line, i);
						if (ret[0] > 0) {
							// TODO: insert header here
							i = ret[0];
							multilineVars.start_new_line = false;
						}
					}
					// gather all the grace notes, chord symbols and decorations
					ret = letter_to_spacer(line, i);
					if (ret[0] > 0) {
						i += ret[0];
					}

					ret = letter_to_chord(line, i);
					if (ret[0] > 0) {
						// There could be more than one chord here if they have different positions.
						// If two chords have the same position, then connect them with newline.
						if (!el.chord)
							el.chord = [];
						var chordName = tokenizer.translateString(ret[1]);
						chordName = chordName.replace(/;/g, "\n");
						var addedChord = false;
						for (var ci = 0; ci < el.chord.length; ci++) {
							if (el.chord[ci].position === ret[2]) {
								addedChord = true;
								el.chord[ci].name += "\n" + chordName;
							}
						}
						if (addedChord === false) {
							if (ret[2] === null && ret[3])
								el.chord.push({name: chordName, rel_position: ret[3]});
							else
								el.chord.push({name: chordName, position: ret[2]});
						}

						i += ret[0];
						var ii = tokenizer.skipWhiteSpace(line.substring(i));
						if (ii > 0)
							el.force_end_beam_last = true;
						i += ii;
					} else {
						if (nonDecorations.indexOf(line.charAt(i)) === -1)
							ret = letter_to_accent(line, i);
						else ret = [ 0 ];
						if (ret[0] > 0) {
							if (ret[1] === null) {
								if (i + 1 < line.length)
									startNewLine();	// There was a ! in the middle of the line. Start a new line if there is anything after it.
							} else if (ret[1].length > 0) {
								if (ret[1].indexOf("style=") === 0) {
									el.style = ret[1].substr(6);
								} else {
									if (el.decoration === undefined)
										el.decoration = [];
									el.decoration.push(ret[1]);
								}
							}
							i += ret[0];
						} else {
							ret = letter_to_grace(line, i);
							// TODO-PER: Be sure there aren't already grace notes defined. That is an error.
							if (ret[0] > 0) {
								el.gracenotes = ret[1];
								i += ret[0];
							} else
								break;
						}
					}
				}

				ret = letter_to_bar(line, i);
				if (ret[0] > 0) {
					// This is definitely a bar
					if (el.gracenotes !== undefined) {
						// Attach the grace note to an invisible note
						el.rest = { type: 'spacer' };
						el.duration = 0.125; // TODO-PER: I don't think the duration of this matters much, but figure out if it does.
						multilineVars.addFormattingOptions(el, tune.formatting, 'note');
						tune.appendElement('note', startOfLine+i, startOfLine+i+ret[0], el);
						multilineVars.measureNotEmpty = true;
						el = {};
					}
					var bar = {type: ret[1]};
					if (bar.type.length === 0)
						warn("Unknown bar type", line, i);
					else {
						if (multilineVars.inEnding && bar.type !== 'bar_thin') {
							bar.endEnding = true;
							multilineVars.inEnding = false;
						}
						if (ret[2]) {
							bar.startEnding = ret[2];
							if (multilineVars.inEnding)
								bar.endEnding = true;
							multilineVars.inEnding = true;
						}
						if (el.decoration !== undefined)
							bar.decoration = el.decoration;
						if (el.chord !== undefined)
							bar.chord = el.chord;
						if (bar.startEnding && multilineVars.barFirstEndingNum === undefined)
							multilineVars.barFirstEndingNum = multilineVars.currBarNumber;
						else if (bar.startEnding && bar.endEnding && multilineVars.barFirstEndingNum)
							multilineVars.currBarNumber = multilineVars.barFirstEndingNum;
						else if (bar.endEnding)
							multilineVars.barFirstEndingNum = undefined;
						if (bar.type !== 'bar_invisible' && multilineVars.measureNotEmpty) {
							var isFirstVoice = multilineVars.currentVoice === undefined || (multilineVars.currentVoice.staffNum ===  0 && multilineVars.currentVoice.index ===  0);
							if (isFirstVoice) {
								multilineVars.currBarNumber++;
								if (multilineVars.barNumbers && multilineVars.currBarNumber % multilineVars.barNumbers === 0)
									bar.barNumber = multilineVars.currBarNumber;
							}
						}
						multilineVars.addFormattingOptions(el, tune.formatting, 'bar');
						tune.appendElement('bar', startOfLine+i, startOfLine+i+ret[0], bar);
						multilineVars.measureNotEmpty = false;
						el = {};
					}
					i += ret[0];
				} else if (line[i] === '&') {	// backtrack to beginning of measure
					warn("Overlay not yet supported", line, i);
					i++;

				} else {
					// This is definitely a note group
					//
					// Look for as many open slurs and triplets as there are. (Note: only the first triplet is valid.)
					ret = letter_to_open_slurs_and_triplets(line, i);
					if (ret.consumed > 0) {
						if (ret.startSlur !== undefined)
							el.startSlur = ret.startSlur;
						if (ret.triplet !== undefined) {
							if (tripletNotesLeft > 0)
								warn("Can't nest triplets", line, i);
							else {
								el.startTriplet = ret.triplet;
								tripletNotesLeft = ret.num_notes === undefined ? ret.triplet : ret.num_notes;
							}
						}
						i += ret.consumed;
					}
					
					ret = letter_to_open_danger(line, i);
					if (ret.consumed > 0) {
						if (ret.startDanger !== undefined)
							el.startDanger = ret.startDanger;
						i += ret.consumed;
					}

					// handle chords.
					if (line.charAt(i) === '[') {
						
						var chordStartChar = i;
						i++;
						var chordDuration = null;

						var done = false;
						while (!done) {
							var chordNote = getCoreNote(line, i, {}, false);
							if (chordNote !== null) {
								if (chordNote.end_beam) {
									el.end_beam = true;
									delete chordNote.end_beam;
								}
								if (el.pitches === undefined) {
									el.duration = chordNote.duration;
									el.pitches = [ chordNote ];
								} else	// Just ignore the note lengths of all but the first note. The standard isn't clear here, but this seems less confusing.
									el.pitches.push(chordNote);
								delete chordNote.duration;

								if (multilineVars.inTieChord[el.pitches.length]) {
									chordNote.endTie = true;
									multilineVars.inTieChord[el.pitches.length] = undefined;
								}
								if (chordNote.startTie)
									multilineVars.inTieChord[el.pitches.length] = true;

								i  = chordNote.endChar;
								delete chordNote.endChar;
							} else if (line.charAt(i) === ' ') {
								// Spaces are not allowed in chords, but we can recover from it by ignoring it.
								warn("Spaces are not allowed in chords", line, i);
								i++;
							} else {
								if (i < line.length && line.charAt(i) === ']') {
									// consume the close bracket
									i++;

									if (multilineVars.next_note_duration !== 0) {
										el.duration = el.duration * multilineVars.next_note_duration;
										multilineVars.next_note_duration = 0;
									}

									if (multilineVars.inTie) {
										window.ABCJS.parse.each(el.pitches, function(pitch) { pitch.endTie = true; });
										multilineVars.inTie = false;
									}

									if (tripletNotesLeft > 0) {
										tripletNotesLeft--;
										if (tripletNotesLeft === 0) {
											el.endTriplet = true;
										}
									}

									var postChordDone = false;
									while (i < line.length && !postChordDone) {
										switch (line.charAt(i)) {
											case ' ':
											case '\t':
												addEndBeam(el);
												break;
											case ')':
												if (el.endSlur === undefined) el.endSlur = 1; else el.endSlur++;
												break;
											case '\\':
												if (el.endDanger === undefined) el.endDanger = 1; else el.endDanger++;
												break;
											case '-':
												window.ABCJS.parse.each(el.pitches, function(pitch) { pitch.startTie = {}; });
												multilineVars.inTie = true;
												break;
											case '>':
											case '<':
												var br2 = getBrokenRhythm(line, i);
												i += br2[0] - 1;	// index gets incremented below, so we'll let that happen
												multilineVars.next_note_duration = br2[2];
												if (chordDuration)
													chordDuration = chordDuration * br2[1];
												else
													chordDuration = br2[1];
												break;
											case '1':
											case '2':
											case '3':
											case '4':
											case '5':
											case '6':
											case '7':
											case '8':
											case '9':
											case '/':
												var fraction = tokenizer.getFraction(line, i);
												chordDuration = fraction.value;
												i = fraction.index;
												if (line.charAt(i) === '-' || line.charAt(i) === ')' || line.charAt(i) === ' ' || line.charAt(i) === '<' || line.charAt(i) === '>')
													i--; // Subtracting one because one is automatically added below
												else
													postChordDone = true;
												break;
											default:
												postChordDone = true;
												break;
										}
										if (!postChordDone) {
											i++;
										}
									}
								} else
									warn("Expected ']' to end the chords", line, i);

								if (el.pitches !== undefined) {
									if (chordDuration !== null) {
										el.duration = el.duration * chordDuration;
									}
									
									multilineVars.addFormattingOptions(el, tune.formatting, 'note');
									tune.appendElement('note', startOfLine+chordStartChar, startOfLine+i, el);
									multilineVars.measureNotEmpty = true;
									el = {};
								}
								done = true;
							}
						}
					} else {
						conChord = 0;
						
						// Single pitch
						var el2 = {};
						var core = getCoreNote(line, i, el2, true);
						if (el2.endTie !== undefined) multilineVars.inTie = true;
						if (core !== null) {
							if (core.pitch !== undefined) {
								el.pitches = [ { } ];
								// TODO-PER: straighten this out so there is not so much copying: getCoreNote shouldn't change e'
								if (core.accidental !== undefined) el.pitches[0].accidental = core.accidental;
								el.pitches[0].pitch = core.pitch;
								
								if (core.endDanger !== undefined) el.pitches[0].endDanger = core.endDanger;
								
								if (core.endSlur !== undefined) el.pitches[0].endSlur = core.endSlur;
								if (core.endTie !== undefined) el.pitches[0].endTie = core.endTie;
								if (core.startSlur !== undefined) el.pitches[0].startSlur = core.startSlur;
								if (el.startSlur !== undefined) el.pitches[0].startSlur = el.startSlur;
								
								if (core.startDanger !== undefined) el.pitches[0].startDanger = core.startDanger;
								if (el.startDanger !== undefined) el.pitches[0].startDanger = el.startDanger;
								
								if (core.startTie !== undefined) el.pitches[0].startTie = core.startTie;
								if (el.startTie !== undefined) el.pitches[0].startTie = el.startTie;
							
								//[HarmonyChecker] get note and put too part arrays
								if(hc_voice != null){
									if(hc_voice.startsWith("S")){
										soprano.push(el);
									}else if(hc_voice.startsWith("A")){
										alto.push(el);
									}else if(hc_voice.startsWith("T")){
										tenor.push(el);
									}else if(hc_voice.startsWith("B")){
										bass.push(el);
									}
								}
								//
							
							} else {
								el.rest = core.rest;
								if (core.endDanger !== undefined) el.endDanger = core.endDanger;
								
								if (core.endSlur !== undefined) el.endSlur = core.endSlur;
								if (core.endTie !== undefined) el.rest.endTie = core.endTie;
								if (core.startSlur !== undefined) el.startSlur = core.startSlur;
								
								if (core.startDanger !== undefined) el.startDanger = core.startDanger;
								
								if (core.startTie !== undefined) el.rest.startTie = core.startTie;
								if (el.startTie !== undefined) el.rest.startTie = el.startTie;
							}

							if (core.chord !== undefined) el.chord = core.chord;
							if (core.duration !== undefined) el.duration = core.duration;
							if (core.decoration !== undefined) el.decoration = core.decoration;
							if (core.graceNotes !== undefined) el.graceNotes = core.graceNotes;
							
							delete el.startDanger;
							delete el.startSlur;
							if (multilineVars.inTie) {
								if (el.pitches !== undefined) {
									el.pitches[0].endTie = true;
									multilineVars.inTie = false;
								} else if (el.rest.type !== 'spacer') {
									el.rest.endTie = true;
									multilineVars.inTie = false;
								}
							}
							if (core.startTie || el.startTie)
								multilineVars.inTie = true;
							i  = core.endChar;

							if (tripletNotesLeft > 0) {
								tripletNotesLeft--;
								if (tripletNotesLeft === 0) {
									el.endTriplet = true;
								}
							}

							if (core.end_beam)
								addEndBeam(el);

							// If there is a whole rest, then it should be the duration of the measure, not it's own duration. We need to special case it.
							if (el.rest && el.rest.type === 'rest' && el.duration === 1) {
								el.rest.type = 'whole';

								el.duration = durationOfMeasure(multilineVars);
							}
							
							multilineVars.addFormattingOptions(el, tune.formatting, 'note');
							tune.appendElement('note', startOfLine+startI, startOfLine+i, el);
							multilineVars.measureNotEmpty = true;
							el = {};
						}
					}

					if (i === startI) {	// don't know what this is, so ignore it.
						if (line.charAt(i) !== ' ' && line.charAt(i) !== '`')
							warn("Unknown character ignored", line, i);
						i++;
					}
				}
			}
		}
		
		//[HarmonyChecker] run parallel check function 6 times
		checkParallel(bass,tenor);
		checkParallel(bass,alto);
		checkParallel(bass,soprano);
		checkParallel(tenor,alto);
		checkParallel(tenor,soprano);
		checkParallel(alto,soprano);
		//
	};
	
	//[HarmonyChecker] HarmonyCheck
	function checkParallel(lineLo, lineUp){
		
		var str = "";
		if(lineLo == bass && lineUp == tenor){
			str = "B-T"
		}else if(lineLo == bass && lineUp == alto){
			str = "B-A"
		}else if(lineLo == bass && lineUp == soprano){
			str = "B-S"
		}else if(lineLo == tenor && lineUp == alto){
			str = "T-A"
		}else if(lineLo == tenor && lineUp == soprano){
			str = "T-S"
		}else if(lineLo == alto && lineUp == soprano){
			str = "A-S"
		}
		
		for (var i = 0; i < bass.length - 1; i++) {
			var upper1 = noteNum(lineUp[i].pitches[0].pitch,lineUp[i].pitches[0].accidental);
			var lower1 = noteNum(lineLo[i].pitches[0].pitch,lineLo[i].pitches[0].accidental);
			var upper2 = noteNum(lineUp[i+1].pitches[0].pitch,lineUp[i+1].pitches[0].accidental);
			var lower2 = noteNum(lineLo[i+1].pitches[0].pitch,lineLo[i+1].pitches[0].accidental);
			
			if((upper1 - lower1) %12  == 7){
				if((upper2 - lower2) %12 == 7){
					warnParallel(5, toReadableNote(upper1), toReadableNote(lower1), toReadableNote(upper2), toReadableNote(lower2),str);
					lineUp[i].startDanger = 1;
					lineUp[i+1].endDanger = 1;
					lineLo[i].startDanger = 1;
					lineLo[i+1].endDanger = 1;
				}
			}else if((upper1 - lower1) %12 == 0){
				if((upper2 - lower2) %12 == 0){
					warnParallel(8, toReadableNote(upper1), toReadableNote(lower1), toReadableNote(upper2), toReadableNote(lower2),str);
					lineUp[i].startDanger = 1;
					lineUp[i+1].endDanger = 1;
					lineLo[i].startDanger = 1;
					lineLo[i+1].endDanger = 1;
				}
			}
		}
	}
	
	var warnParallel = function colorTrace(type, Up1, Lo1, Up2, Lo2, comment) {
		
		var warnType = '';
		if(type == 5){
			warnType = 'Parallel 5th';
		}else if(type == 8){
			warnType = 'Parallel 8ve';
		}else if(type == 0){
			warnType = 'Exposed';
		}
		
		if(type == 5){
			console.log("%c[HarmonyChecker] %c!!Parallel 5th!! %c" + comment, "color:black;font-weight:bold;", "color:red;font-weight:bold;", "color:#cccccc;font-weight:normal;border: 1px solid #cccccc");
			
		}else{
			console.log("%c[HarmonyChecker] %c!!Parallel 8th!! %c" + comment, "color:black;font-weight:bold;", "color:blue;font-weight:bold;", "color:#cccccc;font-weight:normal;border: 1px solid #cccccc");
		}
		
		console.log("^ >>>> " + Up1 + " > " + Up2);
		console.log("v >>>> " + Lo1 + " > " + Lo2);
	
		var ul = document.getElementById("output");
		
		var li = document.createElement("li");
			li.setAttribute("id", "paralell5");
			ul.appendChild(li);
			
		var a = document.createElement("a");
			a.setAttribute("class", "thumbnail");
			a.appendChild(document.createTextNode(comment));
			li.appendChild(a);
		
		var div = document.createElement("div");
			div.setAttribute("class", "content");
			li.appendChild(div);
		
		var h3 = document.createElement("h3");
			h3.appendChild(document.createTextNode(warnType + " ⚠️"));
			div.appendChild(h3);
		
		var span1 = document.createElement("span");
			span1.setAttribute("class", "preview");
			span1.appendChild(document.createTextNode("^ >>>> " + Up1 + " > " + Up2));
			div.appendChild(span1);
		
		var span2 = document.createElement("span");
			span2.setAttribute("class", "meta");
			span2.appendChild(document.createTextNode("v >>>> " + Lo1 + " > " + Lo2));
			div.appendChild(span2);
	}
	//

	var parseLine = function(line) {
		var ret = header.parseHeader(line);
		if (ret.regular)
			parseRegularMusicLine(ret.str);
		if (ret.newline && multilineVars.continueall === undefined)
			startNewLine();
		if (ret.words)
			addWords(tune.getCurrentVoice(), line.substring(2));
		if (ret.symbols)
			addSymbols(tune.getCurrentVoice(), line.substring(2));
		if (ret.recurse)
			parseLine(ret.str);
	};

	function appendLastMeasure(voice, nextVoice) {
		voice.push({
			el_type: 'hint'
		});
		for (var i = 0; i < nextVoice.length; i++) {
			var element = nextVoice[i];
			var hint = window.ABCJS.parse.clone(element);
			voice.push(hint);
			if (element.el_type === 'bar')
					return;
		}
	}

	function addHintMeasure(staff, nextStaff) {
		for (var i = 0; i < staff.length; i++) {
			var stave = staff[i];
			var nextStave = nextStaff[i];
			if (nextStave) { // Be sure there is the same number of staves on the next line.
				for (var j = 0; j < nextStave.voices.length; j++) {
					var nextVoice = nextStave.voices[j];
					var voice = stave.voices[j];
					if (voice) { // Be sure there are the same number of voices on the previous line.
						appendLastMeasure(voice, nextVoice);
					}
				}
			}
		}
	}

	function addHintMeasures() {
		for (var i = 0; i < tune.lines.length; i++) {
			var line = tune.lines[i].staff;
			if (line) {
				var j = i+1;
				while (j < tune.lines.length && tune.lines[j].staff === undefined)
					j++;
				if (j < tune.lines.length) {
					var nextLine = tune.lines[j].staff;
					addHintMeasure(line, nextLine);
				}
			}
		}
	}

	this.parse = function(strTune, switches) {
		// the switches are optional and cause a difference in the way the tune is parsed.
		// switches.header_only : stop parsing when the header is finished
		// switches.stop_on_warning : stop at the first warning encountered.
		// switches.print: format for the page instead of the browser.
		// switches.format: a hash of the desired formatting commands.
		// switches.hint_measures: put the next measure at the end of the current line.
		if (!switches) switches = {};
		tune.reset();
		if (switches.print)
			tune.media = 'print';
		multilineVars.reset();
		header.reset(tokenizer, warn, multilineVars, tune);

		// Take care of whatever line endings come our way
		strTune = window.ABCJS.parse.gsub(strTune, '\r\n', '\n');
		strTune = window.ABCJS.parse.gsub(strTune, '\r', '\n');
		strTune += '\n';	// Tacked on temporarily to make the last line continuation work
		strTune = strTune.replace(/\n\\.*\n/g, "\n");	// get rid of latex commands.
		var continuationReplacement = function(all, backslash, comment){
			var spaces = "                                                                                                                                                                                                     ";
			var padding = comment ? spaces.substring(0, comment.length) : "";
			return backslash + " \x12" + padding;
		};
		strTune = strTune.replace(/\\([ \t]*)(%.*)*\n/g, continuationReplacement);	// take care of line continuations right away, but keep the same number of characters
		var lines = strTune.split('\n');
		if (window.ABCJS.parse.last(lines).length === 0)	// remove the blank line we added above.
			lines.pop();
		try {
			if (switches.format) {
				window.ABCJS.parse.parseDirective.globalFormatting(switches.format);
			}
			window.ABCJS.parse.each(lines,  function(line) {
				if (switches.header_only && multilineVars.is_in_header === false)
					throw "normal_abort";
				if (switches.stop_on_warning && multilineVars.warnings)
					throw "normal_abort";
				if (multilineVars.is_in_history) {
					if (line.charAt(1) === ':') {
						multilineVars.is_in_history = false;
						parseLine(line);
					} else
						tune.addMetaText("history", tokenizer.translateString(tokenizer.stripComment(line)));
				} else if (multilineVars.inTextBlock) {
					if (window.ABCJS.parse.startsWith(line, "%%endtext")) {
						//tune.addMetaText("textBlock", multilineVars.textBlock);
						tune.addText(multilineVars.textBlock);
						multilineVars.inTextBlock = false;
					}
					else {
						if (window.ABCJS.parse.startsWith(line, "%%"))
							multilineVars.textBlock += ' ' + line.substring(2);
						else
							multilineVars.textBlock += ' ' + line;
					}
				} else if (multilineVars.inPsBlock) {
					if (window.ABCJS.parse.startsWith(line, "%%endps")) {
						// Just ignore postscript
						multilineVars.inPsBlock = false;
					}
					else
						multilineVars.textBlock += ' ' + line;
				} else
					parseLine(line);
				multilineVars.iChar += line.length + 1;
			});
			var ph = 11*72;
			var pl = 8.5*72;
			switch (multilineVars.papersize) {
				//case "letter": ph = 11*72; pl = 8.5*72; break;
				case "legal": ph = 14*72; pl = 8.5*72; break;
				case "A4": ph = 11.7*72; pl = 8.3*72; break;
			}
			if (multilineVars.landscape) {
				var x = ph;
				ph = pl;
				pl = x;
			}
			multilineVars.openSlurs = tune.cleanUp(pl, ph, multilineVars.barsperstaff, multilineVars.staffnonote, multilineVars.openSlurs, "slurs");
			multilineVars.openDangers = tune.cleanUp(pl, ph, multilineVars.barsperstaff, multilineVars.staffnonote, multilineVars.openDangers, "dangers");
		} catch (err) {
			if (err !== "normal_abort")
				throw err;
		}
		if (switches.hint_measures) {
			addHintMeasures();
		}
	};
};
