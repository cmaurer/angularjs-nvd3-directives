
angular.module('nvd3ChartDirectives')
    /*
     Common functions that sets up width, height, margin
     should prevent NaN errors
     */
    .constant('nvd3Helpers', {
      defaults: function () {
        return {
          margin: {left: 50, top: 50, bottom: 50, right: 50},
          x: function(d){ return d[0]; },
          y: function(d){ return d[1]; },
          forceY: [0],
          showValues: false,
          tooltips: false,
          showXAxis: false,
          showYAxis: false,
          showLegend: false,
          showControls: false,
          interactive: false,
          noData: 'No Data Available.',
          staggerLabels: false,
          color: nv.utils.defaultColor()
        };
      },


      chartDefaults: {
        bulletChart: {
          forceX: [],
          orient: 'left',
          tickFormat: null
        },
        cumulativeLineChart: {
          forceX: [],
          rightAlignYAxis: false,
          clipEdge: false,
          clipVoronoi: false,
          useVoronoi: false,
          average: function (d) { return d.average; },
          isArea: function (d) { return d.area; }
        },
        discreteBarChart: {
        },
        lineChart: {
          forceX: [],
          size: function (d) { return (d.size === undefined ? 1 : d.size); },
          rightAlignYAxis: false,
          clipEdge: false,
          clipVoronoi: false,
          interpolate: 'linear',
          isArea: function (d) { return d.area; }
        },
        linePlusBar: {
          forceX: [],
          interpolate: 'linear'
        },
        lineWithFocusChart: {
          forceX: [],
          height2: 200,
          size: function (d) { return (d.size === undefined ? 1 : d.size); },
          isArea: function (d) { return d.area; },
          clipEdge: false,
          clipVoronoi: false,
          interpolate: 'liear'
        },
        multiBarChart: {
        },
        multiBarHorizontalChart: {
          stacked: false
        },
        pieChart: {
          forceX: [],
          labelThreshold: 0.02,
          labelType: 'key',
          pieLabelsOutside: true,
          valueFormat: d3.format(',.2f'),
          description: function(d) { return d.description; },
          donutLabelsOutside: false,
          donut: false,
          donutRatio: 0.5
        },
        scatterChart: {
          forceX: [],
          size: function (d) { return (d.size === undefined ? 1 : d.size); },
          forceSize: [],
          tooltipContent: null,
          tooltipXContent: function(key, x) { return '<strong>' + x + '</strong>'; },
          tooltipYContent: function(key, x, y) { return '<strong>' + y + '</strong>'; },
          showDistX: false,
          showDistY: false,
          xPadding: 0,
          yPadding: 0,
          fisheye: 0,
          transitionDuration: 250
        },
        scatterPlusLineChart: {
          forceX: [],
          size: function (d) { return (d.size === undefined ? 1 : d.size); },
          tooltipContent: null,
          tooltipXContent: function(key, x) { return '<strong>' + x + '</strong>'; },
          tooltipYContent: function(key, x, y) { return '<strong>' + y + '</strong>'; },
          showDistX: false,
          showDistY: false,
          fisheye: 0,
          transitionDuration: 250
        },
        sparklinePlus: {
          forceX: [],
          xTickFormat: d3.format(',r'),
          yTickFormat: d3.format(',.2f'),
          showValue: true,
          alignValue: true,
          rightAlignValue: false
        },
        stackedAreaChart: {
          forceX: [],
          size: function (d) { return (d.size === undefined ? 1 : d.size); },
          forceSize: [],
          clipEdge: false
        }
      },


      getD3Selector: function (attrs, element) {
        if (!attrs.id) {
          //if an id is not supplied, create a random id.
          if (!attrs['data-chartid']) {
            angular.element(element).attr('data-chartid', 'chartid' + Math.floor(Math.random() * 1000000001));
          }
          return '[data-chartid=' + attrs['data-chartid'] + ']';
        } else {
          return '#' + attrs.id;
        }
      },


      rewriteOptions: function (chart, options) {
        var special = {
          'yAxis': true,
          'y1Axis': true,
          'y2Axis': true,
          'xAxis': true,
          'x1Axis': true,
          'x2Axis': true,
          'legend': true
        };
        var invoke = {
          'scale': true
        };
        function internal (chart, options, defaults) {
          angular.forEach(options, function (value, key) {
            if (angular.isFunction(chart[key]) && !special[key]) {
              if (!angular.isUndefined(value)) {
                chart[key](value);
              }
              delete defaults[key];
            } else if (angular.isObject(chart[key])) {
              internal(invoke[key] ? chart[key]() : chart[key], value, defaults[key]);
              delete defaults[key];
            }
          });

          angular.forEach(defaults, function (value, key) {
            if (angular.isFunction(chart[key]) && !special[key]) {
              if (!angular.isUndefined(value)) {
                chart[key](value);
              }
            } else if (angular.isObject(chart[key])) {
              internal(invoke[key] ? chart[key]() : chart[key], value, defaults[key]);
            }
          });
        }

        internal(chart, options, this.merge(this.defaults(), this.chartDefaults[options.chartType]));
      },


      merge: function (dst) {
        angular.forEach(arguments, function(obj) {
          if (obj && obj !== dst) {
            angular.forEach(obj, function(value, key) {
              if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
                this.merge(dst[key], value);
              } else {
                dst[key] = value;
              }
            });
          }
        });
        return dst;
      },


      checkElementID: function (scope, attrs, element, chart, data) {
        processEvents(chart, scope);

        var svgElem = element.find('svg')[0];

        if (angular.isArray(data) && data.length === 0) {
          d3.select(svgElem).remove();
        }
        if (d3.select(svgElem).empty()) {
          d3.select(element)
              .append('svg');
        }
        d3.select(svgElem)
            .attr('viewBox', '0 0 ' + scope.opts.width + ' ' + scope.opts.height)
            .datum(data)
            .transition().duration((attrs.transitionduration === undefined ? 250 : (+attrs.transitionduration)))
            .call(chart);
      },


      updateDimensions: function (scope, attrs, element, chart) {
        if (chart) {
          chart.width(scope.opts.width).height(scope.opts.height);
          var d3Select = getD3Selector(attrs, element);
          d3.select(d3Select + ' svg')
              .attr('viewBox', '0 0 ' + scope.opts.width + ' ' + scope.opts.height);
          nv.utils.windowResize(chart);
          scope.chart.update();
        }
      }
    });
