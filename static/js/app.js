var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
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
d3.csv("static/data/data.csv").then(function(completeData) {
    
  // Step 1: Parse Data/Cast (change string (from CSV) into number format)
  // =========================================================================
  completeData.forEach(function(data) {
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

  console.log(`Total data length is ${completeData.length}.`);

  // Step 2: Create scale functions
  // ==============================
  var xLinearScale = d3.scaleLinear().range([0, width]);
  var yLinearScale = d3.scaleLinear().range([height, 0]);

  // Step 3: Create axis functions
  // ==============================
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Step 4: Find domain for x & y Scales
  //======================================
  // Variables store minimum and maximum values in a column in data.csv
  var xMin;
  var xMax;
  var yMin;
  var yMax;

  // Function identifies the minimum and maximum values in a column in data.csv
  // and assigns them to xMin and xMax variables, which defines the axis domain
  function findMinAndMax(dataColumnX, dataColumnY) {
    xMin = d3.min(completeData, function(data) {
      return parseInt(data[dataColumnX]) * 0.8;
    });

    xMax = d3.max(completeData, function(data) {
      return parseInt(data[dataColumnX]) * 1.1;
    });

    yMin = d3.min(completeData, function(data) {
      return parseInt(data[dataColumnY]) * 0.8;
    });

    yMax = d3.max(completeData, function(data) {
      return parseInt(data[dataColumnY]) * 1.1;
    });
  }

  // Step 5: Set default value for Axes
  //====================================
  // Another axis can be assigned to the variable during an onclick event.
  var currentAxisLabelX = "poverty";
  var currentAxisLabelY = "healthcare";

  // Call findMinAndMax() with default
  findMinAndMax(currentAxisLabelX, currentAxisLabelY);

  // Set domain of an axis to extend from min to max values of the data column
  xLinearScale.domain([xMin, xMax]);
  yLinearScale.domain([yMin, yMax]);

  // Step 6: Append Axes to the chart
  // ==============================
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    // The class name assigned here will be used for transition effects
    .attr("class", "x-axis")
    .call(bottomAxis);

  chartGroup.append("g")
    .attr("class", "y-axis")
    .call(leftAxis);

  // Step 7: Create Circles
  // ==============================
  var circlesGroup = chartGroup.selectAll("circle")
  .data(completeData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[currentAxisLabelX]))
  .attr("cy", d => yLinearScale(d[currentAxisLabelY]))
  .attr("r", "11")
  .attr("fill", "red")
  .attr("opacity", ".5");

  var circlesGroup = chartGroup.selectAll("label")
  .data(completeData)
  .enter()
  .append("text")
  .attr("class","stateText")
  .text(d  => d.abbr)
  .attr("x", d => xLinearScale(d[currentAxisLabelX])-1)
  .attr("y", d => yLinearScale(d[currentAxisLabelY])+4)
  .attr("font-size",10)
  .attr("font-weight", "bold")
  .attr("fill", "black");

  // Step 8: Initialize tool tip
  // ==============================
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      var stateName = d.state;
      var xAxisName = "";
      var xAxisVal = d[currentAxisLabelX];
      var yAxisName = "";
      var yAxisVal = d[currentAxisLabelY];
      // Tooltip text depends on which axis is active
      if (currentAxisLabelX === "poverty") {
        xAxisName = "In Poverty (%)";
      }
      else if (currentAxisLabelX === "age") {
        xAxisName = "Age (Median)";
      }
      else {
        xAxisName = "Household Income (Median)";
      }

      if (currentAxisLabelY === "healthcare") {
        yAxisName = "Lacks Healthcare (%)";
      }
      else if (currentAxisLabelY === "smokes") {
        yAxisName = "Smokes (%)";
      }
      else {
        yAxisName = "Obese (%) ";
      }
      return (`${stateName}<br>${xAxisName}: ${xAxisVal} <br>${yAxisName}: ${yAxisVal} `)
    })
    .attr("font-weight", "bold")
    .attr("fill", "black");

  // Step 9: Create tooltip in the chart
  // ==============================
  chartGroup.call(toolTip);

  // Step 10: Create event listeners to display and hide the tooltip
  // ==============================
  circlesGroup.on("click", function(data) {
      toolTip.show(data, this);
  })
  // onmouseout event
  .on("mouseout", function(data) {
      toolTip.hide(data);
  });
  
  // Step 11: Create axes labels (y-axis)
  //=====================================
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 45)
    .attr("x", 0 - (height / 1.5))
    .attr("dy", "1em")
    .attr("font-size",10)
    .attr("font-weight", "bold")
    .attr("class", "axis-text")
    .attr("data-yaxis-name", "healthcare")
    .text("Lacks Healthcare (%)");
  
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 30)
    .attr("x", 0 - (height / 1.5))
    // This axis label is inactive by default
    .attr("font-size", 10)
    .attr("class", "axis-text inactive")
    .attr("data-yaxis-name", "smokes")
    .text("Smokes (%)");
  
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 15)
    .attr("x", 0 - (height / 1.5))
    // This axis label is inactive by default
    .attr("font-size", 10)
    .attr("class", "axis-text inactive")
    .attr("data-yaxis-name", "obesity")
    .text("Obese (%)");
  
  // create axes labels (x-axis)
  chartGroup.append("text")
    .attr("transform", `translate(${width/2.5}, ${height + margin.top + 10})`)
    .attr("font-size", 10)
    .attr("font-weight", "bold")
    .attr("class", "axis-text")
    .attr("data-xaxis-name", "poverty")
    .text("In Poverty (%)");
  
  chartGroup.append("text")
    .attr("transform", `translate(${width/2.5}, ${height + margin.top + 25})`)
    // This axis label is inactive by default
    .attr("font-size", 10)
    .attr("class", "axis-text inactive")
    .attr("data-xaxis-name", "age")
    .text("Age (Median)");
  
  chartGroup.append("text")
    .attr("transform", `translate(${width/2.5}, ${height + margin.top + 40})`)
    // This axis label is inactive by default
    .attr("font-size", 10)
    .attr("class", "axis-text inactive")
    .attr("data-xaxis-name", "income")
    .text("Household Income (Median)");
  
  // Change an axis's status from inactive to active when clicked (if it was inactive)
  // Change the status of all active axes to inactive otherwise
  function labelChange(clickedAxis) {
    d3
      .selectAll(".axis-text")
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    clickedAxis.classed("inactive", false).classed("active", true);
  }

  d3.selectAll(".axis-text").on("click", function() {
    var clickedSelection = d3.select(this);
    
    var isClickedSelectionInactive = clickedSelection.classed("inactive");
    
    var clickedXAxis = clickedSelection.attr("data-xaxis-name");
    var clickedYAxis = clickedSelection.attr("data-yaxis-name");
    // Handling cases where other axis is null (since only one axis is clicked at a given time), 
    // hence re-assigning it to current selection
    console.log("before clickedXAxis",clickedXAxis);
    console.log("before clickedYAxis",clickedYAxis);
    if (clickedXAxis == null)
      clickedXAxis = currentAxisLabelX;
    if (clickedYAxis == null)
      clickedYAxis = currentAxisLabelY;
    console.log("after clickedXAxis",clickedXAxis);
    console.log("after clickedYAxis",clickedYAxis);
    console.log("currentAxisLabelX",currentAxisLabelX);
    console.log("currentAxisLabelY",currentAxisLabelY);

    if (isClickedSelectionInactive) {
      currentAxisLabelX = clickedXAxis;
      currentAxisLabelY = clickedYAxis;
      console.log("in if currentAxisLabelX",currentAxisLabelX);
      console.log("in if currentAxisLabelY",currentAxisLabelY);
      findMinAndMax(currentAxisLabelX, currentAxisLabelY);
      // Set the domain for the x-axis
      xLinearScale.domain([xMin, xMax]);
      yLinearScale.domain([yMin, yMax]);
      // Create a transition effect for the x-axis
      svg
        .select(".x-axis")
        .transition()
        .duration(1800)
        .call(bottomAxis);

      // Select all circles to create a transition effect, then relocate its horizontal location
      // based on the new axis that was selected/clicked
      d3.selectAll("circle").each(function() {
        d3
          .select(this)
          .transition()
          .attr("cx", function(data, index) {
            return xLinearScale(data[currentAxisLabelX]);
          })
          .attr("cy", function(data, index) {
            return yLinearScale(data[currentAxisLabelY]);
          })
          .duration(1800);
      });

      d3.selectAll(".stateText").each(function() {
        d3
          .select(this)
          .transition()
          .attr("x", function(data, index) {
            return xLinearScale(data[currentAxisLabelX]);
          })
          .attr("y", function(data, index) {
            return yLinearScale(data[currentAxisLabelY]);
          })
          .duration(1800);
      });

      // Change the status of the axes. See above for more info on this function.
      labelChange(clickedSelection);
    }
  });
});



