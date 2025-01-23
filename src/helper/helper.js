export const sortData = (dataToSort, sorting) => {
	if (dataToSort?.length > 0) {
		return dataToSort.sort((a, b) => {
			if (sorting) {
				return a.es.localeCompare(b.es);
			} else {
				return b.es.localeCompare(a.es);
			}
		});
	}
};