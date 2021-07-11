// @TODO: YOUR CODE HERE!

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = 'healthcare';

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, text) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circlesGroup, text;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "In Poverty: ";
  }

  else if (chosenXAxis === "income") {
    label = "Household Income: ";
  }

  else {
    label = "Age (Median)";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}<br> Lacks Healthcare: `);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv"). then(function(healthData, err) {
  if (err) throw err;

  // parse data
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);

  // Create y scale function
  function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis])*0.4,
        d3.max(healthData, d => d[chosenYAxis]) * 3.5
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }
  
  // function used for updating xAxis var upon click on axis label
  function renderAxes(newYScale, yAxis) {
    var leftAxis = d3.axisBottom(newYScale);
  
    xAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  //////////
  var yLinearScale = yScale(healthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("opacity", "1")


  var text = chartGroup.selectAll("text")
  .data(healthData)
  .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.healthcare))
    .attr("font-size", "10")
    .attr("fill", "white")
    .attr("opacity", "1")
    .text(function(d) { return d.abbr; })
    .attr("dy", "0.3em")
    .attr("dx", "-0.9em")
    // .attr("transform", `translate(${margin.left}, ${margin.top})`)
   
  

//append initial text for circles
  // var text = chartGroup.selectAll("text")
  //   .data(healthData)
  //   .enter()
  //   .append("text")
  //   .attr("x", d => xLinearScale(d[chosenXAxis]))
  //   .attr("y", d => yLinearScale(d.healthcare))
  //   .text(function(d) { return d.abbr; })
  //   .attr("dy", "0.3em")
  //   .attr("dx", "-0.7em")
  //   // .attr("transform", `translate(${margin.left}, ${margin.top})`)
  //   .attr("font-size", "10")
  //   .attr("fill", "white")


  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", true)
            .classed("inactive", false);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", false)
            .classed("inactive", false);
            incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});

///////Code for both multiple axis

// // @TODO: YOUR CODE HERE!

// var svgWidth = 960;
// var svgHeight = 500;

// var margin = {
//   top: 20,
//   right: 40,
//   bottom: 80,
//   left: 100
// };

// var width = svgWidth - margin.left - margin.right;
// var height = svgHeight - margin.top - margin.bottom;

// // Create an SVG wrapper, append an SVG group that will hold our chart,
// // and shift the latter by left and top margins.
// var svg = d3
//   .select("#scatter")
//   .append("svg")
//   .attr("width", svgWidth)
//   .attr("height", svgHeight);

// // Append an SVG group
// var chartGroup = svg.append("g")
//   .attr("transform", `translate(${margin.left}, ${margin.top})`);

// // Initial Params
// var chosenXAxis = "poverty";
// var chosenYAxis = 'healthcare';

// // function used for updating x-scale var upon click on axis label
// function xScale(healthData, chosenXAxis) {
//   // create scales
//   var xLinearScale = d3.scaleLinear()
//     .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
//       d3.max(healthData, d => d[chosenXAxis]) * 1.2
//     ])
//     .range([0, width]);

//   return xLinearScale;

// }

// // function used for updating xAxis var upon click on axis label
// function renderAxes(newXScale, xAxis) {
//   var bottomAxis = d3.axisBottom(newXScale);

//   xAxis.transition()
//     .duration(1000)
//     .call(bottomAxis);

//   return xAxis;
// }

// // function used for updating circles group with a transition to
// // new circles
// function renderCircles(circlesGroup, newXScale, chosenXAxis) {

//   circlesGroup.transition()
//     .duration(1000)
//     .attr("cx", d => newXScale(d[chosenXAxis]));

//   return circlesGroup;
// }

// // function used for updating circles group with new tooltip
// function updateToolTip(chosenXAxis, circlesGroup) {

//   var label;

//   if (chosenXAxis === "poverty") {
//     label = "In Poverty: ";
//   }

//   else if (chosenXAxis === "income") {
//     label = "Household Income: ";
//   }

//   else {
//     label = "Age (Median)";
//   }

//   var toolTip = d3.tip()
//     .attr("class", "tooltip")
//     .offset([80, -60])
//     .html(function(d) {
//       return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
//     });

//   circlesGroup.call(toolTip);

//   circlesGroup.on("mouseover", function(data) {
//     toolTip.show(data);
//   })
//     // onmouseout event
//     .on("mouseout", function(data, index) {
//       toolTip.hide(data);
//     });

//   return circlesGroup;
// }

// // Retrieve data from the CSV file and execute everything below
// d3.csv("data.csv"). then(function(healthData, err) {
//   if (err) throw err;

//   // parse data
//   healthData.forEach(function(data) {
//     data.poverty = +data.poverty;
//     data.age = +data.age;
//     data.income = +data.income;
//   });

//   // xLinearScale function above csv import
//   var xLinearScale = xScale(healthData, chosenXAxis);

//   // Create y scale function
//   function yScale(healthData, chosenYAxis) {
//     // create scales
//     var yLinearScale = d3.scaleLinear()
//       .domain([d3.min(healthData, d => d[chosenYAxis])*0.3,
//         d3.max(healthData, d => d[chosenYAxis]) * 3
//       ])
//       .range([height, 0]);
  
//     return yLinearScale;
  
//   }
  
//   // function used for updating xAxis var upon click on axis label
//   function renderAxes(newYScale, yAxis) {
//     var leftAxis = d3.axisBottom(newYScale);
  
//     xAxis.transition()
//       .duration(1000)
//       .call(leftAxis);
  
//     return yAxis;
//   }
//   //////////
//   var yLinearScale = yScale(healthData, chosenYAxis);
//   // var yLinearScale = d3.scaleLinear()
//   //   .domain([0, d3.max(healthData, d => d.healthcare)])
//   //   .range([height, 0]);

//   // Create initial axis functions
//   var bottomAxis = d3.axisBottom(xLinearScale);
//   var leftAxis = d3.axisLeft(yLinearScale);

//   // append x axis
//   var xAxis = chartGroup.append("g")
//     .classed("x-axis", true)
//     .attr("transform", `translate(0, ${height})`)
//     .call(bottomAxis);

//   // append y axis
//   chartGroup.append("g")
//     .call(leftAxis);
  
//   // textGroup.append('g')
//   //   .call(leftAxis);

//   // append initial circles
//   var circlesGroup = chartGroup.selectAll("circle")
//     .data(healthData)
//     .enter()
//     .append("circle")
//     .attr("cx", d => xLinearScale(d[chosenXAxis]))
//     .attr("cy", d => yLinearScale(d.healthcare))
//     .attr("r", 10)
//     .attr("fill", "lightblue")
//     .attr("opacity", ".5")

//   // var textGroup = chartGroup.selectAll("circle")
//   //   .data(healthData)
//   //   .enter()
//   //   .append("abbr")
//   //   .text(d => yLinearScale(d.abbr))
//   //   .attr('font-size',8)//font size
//   //   .attr('dx', -10)//positions text towards the left of the center of the circle
//   //   .attr('dy',4)


//   // Create group for two x-axis labels
//   var labelsGroup = chartGroup.append("g")
//     .attr("transform", `translate(${width / 2}, ${height + 20})`);

//   var povertyLabel = labelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 20)
//     .attr("value", "poverty") // value to grab for event listener
//     .classed("active", true)
//     .text("In Poverty (%)");

//   var ageLabel = labelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 40)
//     .attr("value", "age") // value to grab for event listener
//     .classed("inactive", true)
//     .text("Age (Median)");

//   var incomeLabel = labelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 60)
//     .attr("value", "income") // value to grab for event listener
//     .classed("inactive", true)
//     .text("Household Income (Median)");

//   // append y axis
//   chartGroup.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 0 - margin.left)
//     .attr("x", 0 - (height / 2))
//     .attr("dy", "1em")
//     .classed("axis-text", true)
//     .text("Healthcare");

//   chartGroup.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 17 - margin.left)
//     .attr("x", 0 - (height / 2))
//     .attr("dy", "1em")
//     .classed("axis-text", true)
//     .text("Obesity");

//   chartGroup.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 34 - margin.left)
//     .attr("x", 0 - (height / 2))
//     .attr("dy", "1em")
//     .classed("axis-text", true)
//     .text("Smoke");

//   // updateToolTip function above csv import
//   var circlesGroup = updateToolTip(chosenXAxis, chosenYaxis, circlesGroup);


//   // x axis labels event listener
//   labelsGroup.selectAll("text")
//     .on("click", function() {
//       // get value of selection
//       var valueX = d3.select(this).attr("value");
//       var valueY = d3.select(this).attr("value");
//       if (valueX !== chosenXAxis) {

//         // replaces chosenXAxis with value
//         chosenXAxis = value;

//         // console.log(chosenXAxis)

//         // functions here found above csv import
//         // updates x scale for new data
//         xLinearScale = xScale(healthData, chosenXAxis);

//         // updates x axis with transition
//         xAxis = renderAxes(xLinearScale, xAxis);

//         // updates circles with new x values
//         circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

//         // updates tooltips with new info
//         circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

//         // changes classes to change bold text
//         if (chosenXAxis === "poverty") {
//           povertyLabel
//             .classed("active", true)
//             .classed("inactive", false);
//             ageLabel
//             .classed("active", false)
//             .classed("inactive", true);
//             incomeLabel
//             .classed("active", false)
//             .classed("inactive", true);
//         }
//         else if (chosenXAxis === "age") {
//           povertyLabel
//             .classed("active", false)
//             .classed("inactive", true);
//             ageLabel
//             .classed("active", true)
//             .classed("inactive", false);
//             incomeLabel
//             .classed("active", false)
//             .classed("inactive", true);
//         }
//         else {
//           povertyLabel
//             .classed("active", false)
//             .classed("inactive", true);
//             ageLabel
//             .classed("active", false)
//             .classed("inactive", false);
//             incomeLabel
//             .classed("active", true)
//             .classed("inactive", false);
//         }
//       }
//       if (valueY !== chosenYAxis) {

//         // replaces chosenXAxis with value
//         chosenYAxis = value;

//         // console.log(chosenXAxis)

//         // functions here found above csv import
//         // updates x scale for new data
//         yLinearScale = yScale(healthData, chosenYAxis);

//         // updates x axis with transition
//         yAxis = renderAxes(yLinearScale, yAxis);

//         // updates circles with new x values
//         circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

//         // updates tooltips with new info
//         circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

//         // changes classes to change bold text
//         if (chosenYAxis === "healthcare") {
//           healthcareLabel
//             .classed("active", true)
//             .classed("inactive", false);
//             obesityLabel
//             .classed("active", false)
//             .classed("inactive", true);
//             smokeLabel
//             .classed("active", false)
//             .classed("inactive", true);
//         }
//         else if (chosenYAxis === "obesity") {
//           healthcareLabel
//           .classed("active", false)
//           .classed("inactive", true);
//           obesityLabel
//           .classed("active", true)
//           .classed("inactive", false);
//           smokeLabel
//           .classed("active", false)
//           .classed("inactive", true);
//       }
//         else {
//           healthcareLabel
//           .classed("active", false)
//           .classed("inactive", true);
//           obesityLabel
//           .classed("active", false)
//           .classed("inactive", true);
//           smokeLabel
//           .classed("active", true)
//           .classed("inactive", false);
//         }
//       }
//     });
// }).catch(function(error) {
//   console.log(error);
// });