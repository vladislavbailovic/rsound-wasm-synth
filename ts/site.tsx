const Yo = () => {
	return <p>Yo!</p>;
};

// @ts-expect-error
ReactDOM.render(
	<Yo />,
	document.getElementById('interface')
);
// @ts-expect-error
console.log(ReactDOM);
console.log(document.getElementById('interface'));
