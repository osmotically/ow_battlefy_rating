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
					xhr.open("GET", 'https://ow-api.com/v1/stats/pc/us/' + encodeURI(playerName) + '/complete', true);
					xhr.onreadystatechange = function() {
						var loading = document.createTextNode('(Loading...)');
						if (xhr.readyState == 4) {
							element.removeChild(element.lastChild);
							var res = JSON.parse(xhr.response);
							var rating = res.rating;
							var competitiveStats = res.competitiveStats;
							var topHeroes = competitiveStats ? competitiveStats.topHeroes : {};
							var heroList = Object.keys(topHeroes);
							var sortedHeroes = heroList.filter(hero => topHeroes[hero].timePlayed !== '--').sort(function(a, b) {
								var aTimeUnit = 1;
								if (topHeroes[a].timePlayed.includes('minute')) {
									aTimeUnit = 60;
								} else if (topHeroes[a].timePlayed.includes('hour')) {
									aTimeUnit = 3600;
								}
								var aTimePlayed = topHeroes[a].timePlayed === '--' ? 0 : parseInt(topHeroes[a].timePlayed) * aTimeUnit;
								var bTimeUnit = 1;
								if (topHeroes[b].timePlayed.includes('minute')) {
									bTimeUnit = 60;
								} else if (topHeroes[b].timePlayed.includes('hour')) {
									bTimeUnit = 3600;
								}
								var bTimePlayed = topHeroes[b].timePlayed === '--' ? 0 : parseInt(topHeroes[b].timePlayed) * bTimeUnit;

								return bTimePlayed - aTimePlayed;
							});
							var mostPlayedHeroes = sortedHeroes.slice(0,3);
							var heroNode = null;
							if (mostPlayedHeroes.length > 0) {
								var mostInfo = mostPlayedHeroes.map(
									hero => {
										return hero + ' (Played - ' + topHeroes[hero].timePlayed + ', EPL - ' + topHeroes[hero].eliminationsPerLife + ', Accu - ' + topHeroes[hero].weaponAccuracy + '%)';
									}
								);
								heroNode = document.createElement('span');
								heroNode.style.fontSize = '10px';
								heroNode.style.display = 'inherit';
								mostInfo.map(most => {
									mostSpan = document.createElement('span');
									mostSpan.style.display = 'block';
									mostSpan.appendChild(document.createTextNode(most));
									heroNode.appendChild(mostSpan);
								});
							}

							if (rating === '' || !rating) {
								element.appendChild(document.createTextNode(': Unranked'));
								element.style.width = '320px';
							} else {
								var textnode = document.createTextNode(rating);
								var imagenode = document.createElement("IMG");
								imagenode.src = res.ratingIcon;
								imagenode.style.height = '30px';
								imagenode.style.width = '30px';
								element.appendChild(document.createTextNode(': '));
								element.appendChild(imagenode);
								element.appendChild(textnode);
								element.appendChild(heroNode);
								element.style.width = '410px';
								element.style.marginLeft = '5px';
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
