var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
// Import Data
d3.csv("static/data/data.csv").then(function(phData) {
    
    // Step 1: Parse Data/Cast (change string (from CSV) into number format)
    // =========================================================================
    phData.forEach(function(data) {
      // Getting separate sets  
      // Set 1: Poverty Vs Healthcare
      data.poverty = parseInt(data.poverty);
      data.healthcare = parseInt(data.healthcare);
      
      // Set 2: Age Vs Smoke
      data.age = parseInt(data.age);
      data.smokes = parseInt(data.smokes);

      // Set 3: Household Incomes Vs Obese
      data.income = parseInt(data.income);
      data.obesity = parseInt(data.obesity);

    });

    console.log(`Total data length is ${phData.length}.`);

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([8, d3.max(phData, d => d.poverty)])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([3, d3.max(phData, d => d.healthcare)])
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(phData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "11")
    .attr("fill", "red")
    .attr("opacity", ".5");

    var circlesGroup = chartGroup.selectAll("label")
    .data(phData)
    .enter()
    .append("text")
    .text(d  => d.abbr)
    .attr("x", d => xLinearScale(d.poverty)-5)
    .attr("y", d => yLinearScale(d.healthcare)+4)
    .attr("font-size",10)
    .attr("font-weight", "bold")
    .attr("fill", "black")
    .attr("opacity", ".5");

    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>In Poverty: ${d.poverty} % <br>Lacks Healthcare: ${d.healthcare} %`);
      })
      .attr("font-weight", "bold")
      .attr("fill", "black");

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("click", function(data) {
        toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function(data) {
        toolTip.hide(data);
    });
    
    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 1.5))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .attr("font-size",15)
      .attr("font-weight", "bold")
      .text("Lacks Healthcare (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width/2.5}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .attr("font-size",15)
      .attr("font-weight", "bold")
      .text("In Poverty (%)");
});



