#!/usr/bin/env python3
"""# Analyses for the GraphQL Complexity project

## Imports
"""

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import sys
import json
import pandas as pd
from pprint import pprint

import os
import os.path

"""## Globals"""

APIs = ['github', 'yelp']
MC_ROOT = '' # Must run from within measured-complexity/

DATA_PATH = os.path.join(MC_ROOT, 'data')
FIG_PATH = os.path.join(MC_ROOT, 'figs')
FIG_FILE_FORMAT = 'pdf'

# Create fig directory structure
try:
  os.mkdir(os.path.join(FIG_PATH))
except:
  pass

for api in APIs:
  try:  
    os.mkdir(os.path.join(FIG_PATH, api))
  except:
    pass

PROBE_COMPLEXITY_TYPES = ['type', 'resolve']
OTHER_COMPLEXITY_TYPES = ['type']
COMPLEXITY_TYPE_2_PLOT_MAX_VALUE = { 
    'yelp': {
      'type': 150,
      'resolve': 250,
    },
    'github': {
      'type': 300,
      'resolve': 150
    }
}

PROBE_DATA_FILE_BASENAME = 'our-analysis.json'
def isProbeData(dataFileName):
  return os.path.basename(dataFileName) == PROBE_DATA_FILE_BASENAME

dataFile2CalcOrigin = {
    PROBE_DATA_FILE_BASENAME:             'Our',
    'graphql-validation-complexity.json': 'libA', # 4Catalyzer
    'graphql-query-complexity.json':      'libB', # Slicknode    
    'graphql-cost-analysis.json':         'libC', # pa-bru
}

def roundUp(x, toNearest):
  return (int(x / toNearest) + 1) * toNearest

def roundDown(x, toNearest):
  if toNearest % x == 0:
    return x
  else:
    return roundUp(x, toNearest) - toNearest

"""## Load data"""

# Defines the variable api2complexityDataLists

dataDirs = [os.path.join(DATA_PATH, api) for api in APIs]

def filePathsInDir(path):
  ls = os.listdir(path)
  keep = [f for f in ls if not f.startswith("_") and not f.startswith(".")]
  fullPaths = [os.path.join(path, f) for f in keep]
  p = [p for p in fullPaths if os.path.isfile(p)]
  print("Files in {}: {}".format(path, p))
  return p

class complexityData:
  """Fields: api, dataFileName, calcOrigin, df"""
  def __init__(self, api, dataFileName):
    self.api = api
    self.dataFileName = dataFileName
    self.calcOrigin = dataFile2CalcOrigin[os.path.basename(dataFileName)]
    with open(dataFileName) as f:
      data = json.load(f)
      self.df = pd.DataFrame(data)
      print("Read {}\n  Loaded {} rows for {} - {}".format(dataFileName, len(self.df), self.calcOrigin, self.api))

api2complexityDataLists = {} # 'github' -> complexityData[]
for api in APIs:
  complexityDataLists = []
  dataFiles = filePathsInDir(os.path.join(DATA_PATH, api))
  for dataFile in dataFiles:
    complexityDataLists.append( complexityData(api, dataFile) )
  api2complexityDataLists[api] = complexityDataLists

"""## Plot"""

font = {'family' : 'normal',
        'weight' : 'normal',
        'size'   : 14}
matplotlib.rc('font', **font)

def plotComplexityData(complexityData):
  """Plot all data associated with this complexityData
       - Probe: type and response complexity
       - Others: just type complexity
    
     Saves figure(s) to FIG_PATH/api/<name here>.pdf
  """
  if isProbeData(complexityData.dataFileName):
    complexitiesToPlot = PROBE_COMPLEXITY_TYPES
  else:
    complexitiesToPlot = OTHER_COMPLEXITY_TYPES
  
  for complexityType in complexitiesToPlot:
    xAxLim = COMPLEXITY_TYPE_2_PLOT_MAX_VALUE[complexityData.api][complexityType]
    yAxLim = 2 * xAxLim # roundUp(2.25 * xAxLim, 50)

    #if complexityData.api == 'yelp':
    #  axlabel_fontsize = 18
    #  ticklabel_fontsize = 15
    #  inFigureText_fontsize = 15
    #  nXTicks = -1 # Default
    #  nYTicks = -1 # Default
    #else:
    axlabel_fontsize = 20
    ticklabel_fontsize = 18
    inFigureText_fontsize = 18
    nXTicks = 3
    nYTicks = 3

    # We use our GH data twice, so just generate the charts x2 ??
    if complexityData.calcOrigin == 'Our':
      xlabels = ['Actual response size', 'Actual (response) cxty']
      ylabels = ['Pred. response size', 'Pred. (query) cxty']
      chartNicknames = ['RQ5', 'Standard']
    else:
      xlabels = ['Actual response size']
      ylabels = ['Pred. response size']
      chartNicknames = ['RQ5']

    if complexityData.calcOrigin == 'Our' and complexityData.api == 'yelp':
      if complexityType == 'resolve':
        # Only showing our results for Yelp, and they are tight 
        xAxLim = 100
        yAxLim = 2 * xAxLim
    else:
      pass
      #xlabel = '{} response {} complexity'.format(complexityData.calcOrigin, complexityType)
      #ylabel = '{} query {} complexity'.format(complexityData.calcOrigin, complexityType)   

    # Data
    sub = pd.DataFrame()
    sub['actual'] = complexityData.df['response%sComplexity' % complexityType.capitalize()]
    sub['pred'] = complexityData.df['{}Complexity'.format(complexityType)]
    
    # How many of the responses do we show within axLim?
    nResponsesShown = len(sub[sub['actual'] <= xAxLim])
    percResponsesShown = int(100 * nResponsesShown / len(sub))
    
    # For those responses, how many queries are visible?
    nPredTooBig = len(sub[ (sub['actual'] <= xAxLim) & (sub['pred'] > yAxLim) ])
    percPredTooBig = int(100 * nPredTooBig / nResponsesShown )
    nPredFit = len(sub) - nPredTooBig
    percPredFit = 100 - percPredTooBig

    print("{} - {} - {}: {}% responses fit, {}% of predictions fit".format(complexityData.api, complexityData.calcOrigin, complexityType,
                                  percResponsesShown, percPredFit
                                  ))

    for chartNickname, xlabel, ylabel in zip(chartNicknames, xlabels, ylabels):
      # New figure
      plt.figure()
    
      # Draw diagonal line to demarcate over/under-estimation
      plt.plot(
        [0, xAxLim],
        [0, xAxLim],
        color='r',
        linestyle='-',
        # style='o',
        linewidth=0.5,
        label='Upper bound',
        zorder=-1
      )

      # Heatmap

      norm = matplotlib.colors.Normalize(1e-324,1)
      # colors = [[norm(1e-324), "gold"],
      #           [norm(0.25), "orange"],
      #           [norm(0.5), "red"],
      #           [norm(0.75), "darkred"],
      #           [norm(1.0), "black"]]
      colors = [[norm(1e-324), "lightskyblue"],
                [norm(0.25), "cornflowerblue"],
                [norm(0.5), "blue"],
                [norm(0.75), "darkblue"],
                [norm(1.0), "black"]]
      cmap = matplotlib.colors.LinearSegmentedColormap.from_list("", colors)

      plt.xlabel(xlabel)
      plt.ylabel(ylabel)

      plt.hist2d(
        sub['actual'],
        sub['pred'],
        bins=(100, 100),
        range=[[1, xAxLim], [1, yAxLim]],
        norm=matplotlib.colors.LogNorm(),
        cmap=cmap # plt.get_cmap('viridis')
      )

      # Bound the plot for consistency
      xTickStep = 50
      ax = plt.gca()

      # Tick marks
      xticks = np.linspace(0, roundDown(xAxLim, 50), 3)
      #if nXTicks > 0:
      #  xticks = np.linspace(0, roundDown(xAxLim, 50), nXTicks)
      #else:
      #  xticks = [0]
      #  xticks.extend(range(xTickStep, xAxLim, xTickStep))
      #  xticks.append(xAxLim)
      ax.set_xticks(xticks)

      if yAxLim > xAxLim:
        yMult = 100
      else:
        yMult = 50
      yticks = np.linspace(0, roundDown(yAxLim, yMult), 3)

      #if nYTicks > 0:
      #  yticks = np.linspace(0, roundDown(yAxLim, 50), nYTicks)
      #else:
      #  yticks = [0]
      #  yticks.extend(range(yTickStep, yAxLim, yTickStep))
      #  yticks.append(roundUp(yAxLim, yTickStep))
      ax.set_yticks(yticks)

      ax.tick_params(axis="x", labelsize=ticklabel_fontsize)
      ax.tick_params(axis="y", labelsize=ticklabel_fontsize)

      # Axis labels and legend
      ax.set_xlabel(xlabel, fontsize=axlabel_fontsize)
      ax.set_ylabel(ylabel, fontsize=axlabel_fontsize)
      plt.colorbar()

      if complexityData.api == 'github' and (complexityData.calcOrigin == 'libB' or complexityData.calcOrigin == 'libC'):
        textXPos = 8
        textYPos = 0.9 * yAxLim
      else:
        textXPos = 0.2 * xAxLim
        textYPos = 8
      
      if percResponsesShown < 100 or percPredFit < 100:
        ax.text(textXPos, textYPos, '{}% resp., {}% of preds.'.format(percResponsesShown, percPredFit), fontsize=inFigureText_fontsize)
      else:
        # Show it anyway for consistency
        ax.text(textXPos, textYPos, '{}% resp., {}% of preds.'.format(percResponsesShown, percPredFit), fontsize=inFigureText_fontsize)

      ax.set(xlim=(0, xAxLim), ylim=(0, yAxLim))
      plt.tight_layout(pad=1)
      # plt.show()

      # Save figure
      figPath = os.path.join(FIG_PATH, complexityData.api, '{}-{}-{}-{}-heatmap.{}'.format(complexityData.api, complexityData.calcOrigin, complexityType, chartNickname, FIG_FILE_FORMAT))
      plt.savefig(figPath, bbox_inches='tight', pad_inches = 0)
      print("Plot saved to {}".format(figPath))

def genPlotsForAPI(api, complexityDataLists): 
  for complexityData in complexityDataLists:
    print("Plotting {} data: Generating plots for complexity measure(s) from {}".format(api, complexityData.calcOrigin))
    plotComplexityData(complexityData)

##############
# Sanity check
##############

# responseCxtys = []
# for cdl in api2complexityDataLists['github']:
#   print('{} - {}'.format('github', cdl.calcOrigin))
#   print(cdl.df['responseTypeComplexity'].sort_values())
#   responseCxtys.append(cdl.df['responseTypeComplexity'])

##############
# Actually make the plots
##############

for api, complexityDataList in api2complexityDataLists.items():
  print("Generating plots for API: {}".format(api))
  genPlotsForAPI(api, complexityDataList)
