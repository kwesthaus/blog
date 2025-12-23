#!/usr/bin/env python

import sys
import json

import argparse



parser = argparse.ArgumentParser()
parser.add_argument('infile')
parser.add_argument('outfile')
args = parser.parse_args()




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
    
    # non-unique between the different geojson files I am importing
    # caused issues with caltopo import
    del feat['id']


    new_data['features'].append(feat)

with open(args.outfile, 'w') as outf:
    json.dump(new_data, outf)

print('done')

