function clickBtn() {
	var showHidden = document.getElementById("hidden");
	var changeValue = document.getElementById("read_more_button");
	if (showHidden.style.display == "block") {
		showHidden.style.display = "none";
	} else {
		showHidden.style.display = "block";
	}
	if (changeValue.value == "read more...") {
		changeValue.value = "hide";
	} else {
		changeValue.value = "read more...";
	}
}

