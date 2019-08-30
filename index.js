const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', 600)
  .attr('height', 600);

// Create margins and dimesnions
const margin = {
  top: 20,
  right: 20,
  bottom: 100,
  left: 100
};

const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

//Group
const graph = svg
  .append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left},${margin.top})`);

const xAxisGroup = graph
  .append('g')
  .attr('transform', `translate(0,${graphHeight})`);
const yAxisGroup = graph.append('g');

//Scales & Setup
const y = d3.scaleLinear().range([graphHeight, 0]);

const x = d3
  .scaleBand()
  .range([0, graphWidth])
  .paddingInner(0.2)
  .paddingOuter(0.2);

// //Create axis
const xAxis = d3.axisBottom(x);
const yAxis = d3
  .axisLeft(y)
  .ticks(3)
  .tickFormat(d => d + ' orders');

// Update x axis text
xAxisGroup
  .selectAll('text')
  .attr('transform', 'rotate(-40)')
  .attr('text-anchor', 'end')
  .attr('fill', 'orange');

const transition = d3.transition().duration(1500);

//Update function
const update = data => {
  // updating scales
  const max = d3.max(data, d => d.orders);
  y.domain([0, max]);
  x.domain(data.map(item => item.name));

  // join the data to rects
  const rects = graph.selectAll('rect').data(data);

  // Remove exit selection
  rects.exit().remove();

  // update curretn shapes in DOM
  rects
    .attr('width', x.bandwidth)
    .attr('fill', 'orange')
    .attr('x', d => x(d.name));
  // .transition(transition)
  // .attr('height', d => graphHeight - y(d.orders))
  // .attr('y', d => y(d.orders));

  //Enter, append the enter selection to the DOM
  rects
    .enter()
    .append('rect')
    // .attr('width', x.bandwidth)
    // .attr('width', 0)
    .attr('height', 0)
    .attr('fill', 'orange')
    .attr('x', d => x(d.name))
    .attr('y', graphHeight)
    .merge(rects)
    .transition(transition)
    .attrTween('width', widthTween)
    .attr('height', d => graphHeight - y(d.orders))
    .attr('y', d => y(d.orders));

  // Calling Axis
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
};

let data = [];

db.collection('dishes').onSnapshot(res => {
  res.docChanges().map(change => {
    // console.log(change.doc.data());
    const doc = { ...change.doc.data(), id: change.doc.id };
    switch (change.type) {
      case 'added':
        data.push(doc);
        break;

      case 'modified':
        const index = data.findIndex(item => item.id === doc.id);
        data[index] = doc;
        break;

      case 'removed':
        data = data.filter(item => item.id !== doc.id);
        break;

      default:
        break;
    }
  });

  //Calling the update function
  update(data);
  // .get()
  // .then(res => {
  //   let data = [];
  //   res.docs.map(doc => {
  //     data.push(doc.data());
  //   });

  //   //Calling the update function
  //   update(data);

  //Interval
  // d3.interval(() => {
  //   data[0].orders += 50;
  //   // update(data);
  // }, 1000);
});

//Tweens
const widthTween = d => {
  let i = d3.interpolate(0, x.bandwidth());

  return function(t) {
    return i(t);
  };
};
