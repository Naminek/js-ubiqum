	var makeTable = new Vue({
		el: '#tables',
		data: {
			checkedParty: [],
			selectedState: "",
			states: [],
			senators: [],
			statistics: {
				"number_of_Republican": "0",
				"number_of_Democrats": "0",
				"number_of_Independent": "0",
				"number_og_total": "0",
				"average_for_voting_Republican": "0",
				"average_for_voting_Democrats": "0",
				"average_for_voting_Independent": "0",
				"average_for_total": "0",
				"least_engaged": "0",
				"most_engaged": "0",
				"least_loyal": "0",
				"most_loyal": "0"
			},
			nowLoading: true,
		},

		computed: {

			findSenators: function () {
				if (!this.checkedParty.length) {
					if (!this.selectedState) {
						return this.senators
					} else {
						return this.senators.filter(senator => this.selectedState.includes(senator.state));
					}
				} else {
					if (!this.selectedState) {
						return this.senators.filter(senator => this.checkedParty.includes(senator.party));
					} else {
						var checkedPeople = this.senators.filter(senator => this.checkedParty.includes(senator.party));
						return checkedPeople.filter(senator => this.selectedState.includes(senator.state));
					}
				}
			}

		},
		mounted() {

			var senate = ["https://api.propublica.org/congress/v1/113/senate/members.json", "TGIF Congress113 Senate"];
			var house = ["https://api.propublica.org/congress/v1/113/house/members.json", "TGIF Congress113 House"];

			if (document.title == "TGIF Congress113 Senate" || document.title == "TGIF Congress113 Senate Attendance" || document.title == "TGIF Congress113 Senate Loyalty") {
				this.loadData(senate);
			} else {
				this.loadData(house);
			}

		},

		methods: {

			makeFilter: function (myMembers) {
				var onlyStates = myMembers.map(senator => senator.state);
				var statesOrdered = new Set(onlyStates.sort(function (a, b) {
					return (b < a ? 1 : -1)
				}));
				this.states = [...statesOrdered];
			},


			makeMyStatistics: function (myMembers, myStatistics) {
				//get numbers and averages
				var votesOfR = [];
				var votesOfD = [];
				var votesOfI = [];
				for (var i = 0; i < myMembers.length; i++) {
					if (myMembers[i].party == "R") {
						votesOfR.push(myMembers[i].votes_with_party_pct);
					} else if (myMembers[i].party == "D") {
						votesOfD.push(myMembers[i].votes_with_party_pct);
					} else if (myMembers[i].party == "I") {
						votesOfI.push(myMembers[i].votes_with_party_pct);
					}
				}
				myStatistics.number_of_Republican = votesOfR.length;
				myStatistics.number_of_Democrats = votesOfD.length;
				myStatistics.number_of_Independent = votesOfI.length;
				myStatistics.number_of_total = votesOfR.length + votesOfD.length + votesOfI.length;


				function getSum(votes) {
					var sum = 0;
					for (var i = 0; i < votes.length; i++) {
						sum = sum + votes[i];
					}
					return (sum);
				}
				var sumR = getSum(votesOfR);
				var sumD = getSum(votesOfD);
				var sumI = getSum(votesOfI);

				function getAverage(votes) {
					return (getSum(votes) / votes.length) || 0;
				}

				var averageR = getAverage(votesOfR).toFixed(2);
				var averageD = getAverage(votesOfD).toFixed(2);
				var averageI = getAverage(votesOfI).toFixed(2);
				var averageT = ((sumR + sumD + sumI) / (votesOfR.length + votesOfD.length + votesOfI.length)).toFixed(2);

				myStatistics.average_for_voting_Republican = averageR;
				myStatistics.average_for_voting_Democrats = averageD;
				myStatistics.average_for_voting_Independent = averageI;
				myStatistics.average_for_total = averageT;



				//about parcentage of votes
				function get10PercentMissedVotes(sortMissedVotes, missedVotes) {
					n = Math.ceil(0.1 * sortMissedVotes.length);
					for (var i = 0; i < n; i++) {
						if (sortMissedVotes[i] === sortMissedVotes[n]) {
							n = n + 1;
						}
						missedVotes.push(sortMissedVotes[i]);
					}
				}

				var sortPercentageOfMissedVotes = myMembers.map(member => member.missed_votes_pct).sort(function (a, b) {
					return (a < b ? 1 : -1);
				});
				var bottomMissedVotes = [];
				get10PercentMissedVotes(sortPercentageOfMissedVotes, bottomMissedVotes);

				var sortPercentageOfMissedVotesFromTop = sortPercentageOfMissedVotes.reverse();
				var topMissedVotes = [];
				get10PercentMissedVotes(sortPercentageOfMissedVotesFromTop, topMissedVotes);


				var bottomMissedVotesMember = myMembers.filter(function (self) {
					return self.missed_votes_pct >= bottomMissedVotes[bottomMissedVotes.length - 1];
				});

				function compareMissed(a, b) {
					var r = 0;
					if (a.missed_votes_pct > b.missed_votes_pct) {
						r = -1;
					} else if (a.missed_votes_pct < b.missed_votes_pct) {
						r = 1;
					}
					return r;
				};
				

				var bottomMissedVotesMemberInOrder = bottomMissedVotesMember.sort(compareMissed);

				myStatistics.least_engaged = bottomMissedVotesMemberInOrder;


				var topMissedVotesMember = myMembers.filter(function (self) {
					return self.missed_votes_pct <= topMissedVotes[topMissedVotes.length - 1];
				});
				var topMissedVotesMemberInOrder = topMissedVotesMember.sort(compareMissed).reverse();
				myStatistics.most_engaged = topMissedVotesMemberInOrder;


				function get10PercentPartyVotes(sortPartyVotes, partyVotes) {
					m = Math.ceil(0.1 * sortPartyVotes.length);
					for (var i = 0; i < m; i++) {
						if (sortPartyVotes[i] === sortPartyVotes[m]) {
							m = m + 1;
						}
						partyVotes.push(sortPartyVotes[i]);
					}
				}

				var sortPercentageOfPartyVotes = (myMembers.map(member => member.votes_with_party_pct)).sort(function (a, b) {
					return (a < b ? 1 : -1);
				});
				var topPartyVotes = [];
				get10PercentPartyVotes(sortPercentageOfPartyVotes, topPartyVotes);

				var sortPercentageOfPartyVotesFromBottom = sortPercentageOfPartyVotes.reverse();
				var bottomPartyVotes = [];
				get10PercentPartyVotes(sortPercentageOfPartyVotesFromBottom, bottomPartyVotes);


				var bottomPartyVotesMember = myMembers.filter(function (self) {
					return self.votes_with_party_pct <= bottomPartyVotes[bottomPartyVotes.length - 1];
				});

				function compareParty(a, b) {
					var r = 0;
					if (a.votes_with_party_pct > b.votes_with_party_pct) {
						r = -1;
					} else if (a.votes_with_party_pct < b.votes_with_party_pct) {
						r = 1;
					}
					return r;
				}

				var bottomPartyVotesMemberInOrder = bottomPartyVotesMember.sort(compareParty).reverse();
				myStatistics.least_loyal = bottomPartyVotesMemberInOrder;

				var topPartyVotesMember = myMembers.filter(function (self) {
					return self.votes_with_party_pct >= topPartyVotes[topPartyVotes.length - 1];
				});

				var topPartyVotesMemberInOrder = topPartyVotesMember.sort(compareParty);
				myStatistics.most_loyal = topPartyVotesMemberInOrder;
			},


			loadData: function (pages) {
				fetch(pages[0], {
					method: 'GET',
					headers: {
						'X-API-KEY': '5lHrJfp5SnTSlT1RNOhg6HaQew1hNvsbiBe7gy6O',
						'Content-Type': 'application/json'
					}
				}).then(function (response) {
					return response.json();
				}).then(function (json) {
					if (document.title == pages[1]) {
						makeTable.nowLoading = false;
						makeTable.senators = json.results[0].members;
						makeTable.makeFilter(json.results[0].members);
					} else {
						makeTable.nowLoading = false;
						makeTable.makeMyStatistics(json.results[0].members, makeTable.statistics);
					}
				}).catch(function (error) {
					console.log(error);
				});
			}
		}
	})
