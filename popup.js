// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(
		null,
		{code:`
			var players = Array.from(document.body.getElementsByClassName('player-in-game-name'));
			players.forEach(function(element) {
				if (element.innerText.includes("#")) {
					var playerName = element.innerText.replace("#", "-");
					var xhr = new XMLHttpRequest();
					xhr.open("GET", 'https://ow-api.com/v1/stats/pc/us/' + encodeURI(playerName) + '/profile', true);
					xhr.onreadystatechange = function() {
						var loading = document.createTextNode('(Loading...)');
						if (xhr.readyState == 4) {
							element.removeChild(element.lastChild);
							var res = JSON.parse(xhr.response);
							console.log(res);
							var textnode = document.createTextNode(res.rating);
							if (res.rating === '' || !res.rating) {
								element.appendChild(document.createTextNode(': Unranked'));
							} else {
								var imagenode = document.createElement("IMG");
								imagenode.src = res.ratingIcon;
								imagenode.style.height = '30px';
								imagenode.style.width = '30px';
								element.appendChild(document.createTextNode(': '));
								element.appendChild(imagenode);
								element.appendChild(textnode);
							}
						} else if (xhr.readyState == 3) {
							element.appendChild(loading);
						}
					}
					xhr.send();
				}
			});
		`},
	);
});