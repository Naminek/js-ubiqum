onload = (() => {
	fetch('https://api.propublica.org/congress/v1/113/senate/members.json', {
		method: 'GET',
		headers: {
			'X-API-KEY': '5lHrJfp5SnTSlT1RNOhg6HaQew1hNvsbiBe7gy6O',
			'Content-Type': 'application/json'
		}
	}).then(function (response) {
		return response.json();
	}).then(function (json) {
		createVue(json.results[0].members)
		//		console.log(json.results[0].members.state);
		//		console.log(setFilter.senatorsStates)

	}).catch(function (error) {
		console.log(error);
	});
})()


function createVue(members) {
	var filterTable = new Vue({
		el: '#checkboxes',
		data: {
			checkedParty: [],
			senators: members,
			states: [],
			selectedState: ""
		},
		computed: {
			findSenators: function () {
				//console.log("computed" + this.senators);
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
			this.makeFilter()
		},
		methods: {
			makeFilter: function () {
				var onlyStates = this.senators.map(senator => senator.state);
				var statesOrdered = new Set(onlyStates.sort(function (a, b) {
					return (b < a ? 1 : -1)
				}));
				this.states = [...statesOrdered];
			}
		}

	})
}
