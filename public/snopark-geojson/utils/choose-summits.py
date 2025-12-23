#!/usr/bin/env python

import sys
import json

import argparse



parser = argparse.ArgumentParser()
parser.add_argument('infile')
parser.add_argument('outfile')
parser.add_argument('points')
args = parser.parse_args()

ptstr = args.points + "pt"
print(ptstr)


new_data = {
    "type": "FeatureCollection",
    "crs": {
        "type": "name",
        "properties": {
            "name": "EPSG:4326"
        }
    },
    "features": []
}





with open(args.infile, 'r') as inf:
    old_data = json.load(inf)

for feat in old_data['features']:
    
    title = feat['properties']['title'].split()
    code = title[0]
    points = title[-1]
    name = ' '.join(title[2:-1]).rstrip(',')
    if points != ptstr:
        continue

    # get rid of leading "W7W/" to save visual space
    feat['properties']['title'] = code[4:] + ' ' + name

    new_data['features'].append(feat)

with open(args.outfile, 'w') as outf:
    json.dump(new_data, outf)

print('done')

