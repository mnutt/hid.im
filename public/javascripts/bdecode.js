//
// Jala Project [http://opensvn.csie.org/traccgi/jala]
//
// Copyright 2004 ORF Online und Teletext GmbH
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision$
// $LastChangedBy$
// $LastChangedDate$
// $HeadURL$
//

/**
 * The bdecode method. Turns an encoded string into
 * a corresponding JavaScript object structure.
 * FIXME: Handle with caution...
 * @param {String} code The encoded string.
 * @returns The decoded JavaScript structure.
 * @type Object
 */
var BitTorrent = {};
BitTorrent.bdecode = function(code) {
   var DICTIONARY = "d";
   var LIST       = "l";
   var INTEGER    = "i";
   var STRING     = "s";
   var END        = "e";

   var stack = [];
   var overflowCounter = 0;

   var position = -1, current;

   function getResult() {
      update();
      var result;
      switch (current) {
         case DICTIONARY:
            result = bdecodeDictionary();
            break;
         case LIST:
            result = bdecodeList();
            break;
         case INTEGER:
            result = bdecodeInteger();
            break;
         case END:
         case null:
            //res.debug("*** end detected in getResult()");
            break;
         default:
            result = bdecodeString();               
      }
      return result;
   }

   function update() {
      position += 1;
      current = code.charAt(position);
      /* res.debug("stack: " + stack);
      res.debug("position: " + position);
      res.debug("current: " + current);
      res.debug("remains: " + code.substr(position)); */
      return;
   }

   function overflow() {
      if (overflowCounter++ > 100)
         throw Error("Error parsing bdecoded string");
      return false;
   }

   function bdecodeDictionary() {
      stack.push(DICTIONARY);
      var dictionary = {}, key, value;
      while (current && !overflow()) {
         key = getResult();
         value = getResult();
         if (key && value)
            dictionary[key] = value;
         else
            break;
      }
      stack.pop();
      return dictionary;
   }

   function bdecodeList() {
      stack.push(LIST);
      var list = [], value;
      while (current && !overflow()) {
         var value = getResult();
         if (value)
            list.push(value);
         else
            break;
      }
      stack.pop();
      return list;
   }

   function bdecodeInteger() {
      var integer = "";
      stack.push(integer);
      while (current && !overflow()) {
         update();
         if (current == "e")
            break;
         integer += current;
      }
      if (isNaN(integer))
         throw("Error in bdecoded integer: " + integer + " is not a number");
      //res.debug("integer = " + integer);
      stack.pop();
      return parseInt(integer);
   }

   function bdecodeString() {
      var length = current, string = "";
      stack.push(string);
      update();
      while (current && current != ":" && !overflow()) {
         length += current;
         update();
      }
      if (isNaN(length))
         throw("Error in bdecoded string: invalid length " + length);
      //res.debug("length = " + length);
      length = parseInt(length);
      if (length > code.length - position)
         throw Error("Error parsing bdecoded string");
      for (var i=0; i<length; i+=1) {
         update();
         string += current;
      }
      //res.debug("string = " + string);
      if (string == "creation date")
         void(null);
      stack.pop();
      return string;
   }

   return getResult();
};
