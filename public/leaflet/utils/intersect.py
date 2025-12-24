#!/usr/bin/env python

import json
import shapely
import os
import sys
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('inparcelsdir')
parser.add_argument('outparcelsdir')
args = parser.parse_args()


with open('./nonuniqueID-geojson/GMU_Generalized.geojson', 'r') as f:
    grgmus = json.load(f)

gmuWestJson = [x for x in grgmus['features'] if x['properties']['GMU_Num'] == 485][0]
gmuEastJson = [x for x in grgmus['features'] if x['properties']['GMU_Num'] == 466][0]

gmuWestGeom = shapely.from_geojson(json.dumps(gmuWestJson))
gmuEastGeom = shapely.from_geojson(json.dumps(gmuEastJson))

owner_table = {
    'TACOMA WATER': 'watershed',
    'CITY OF TACOMA': 'watershed',
    'SEATTLE CITY OF SPU-WTR': 'watershed',

    'MUCKLESHOOT INDIAN TRIBE': 'tribe',

    'THE UNITED STATES OF AMERICA': 'federal',
    'UNITED STATES OF AMERICA': 'federal',
    'UNITED STATES': 'federal',
    'USA': 'federal',
    'US GOVERNMENT': 'federal',
    'UNITED STATES FOREST SVC': 'federal',
    'US FOREST SERVICE': 'federal',
    'US DEPT OF AGRICULTURE': 'federal',
    'U S DEPT OF AGRICULTURE': 'federal',
    'USA (DOA)': 'federal',
    'USDA FOREST SERVICE': 'federal',
    'USA (WNF)': 'federal',
    
    'DEPT OF NATURAL RESOURCES': 'state',

    'ENUMCLAW SCHOOL DIST 216': 'local',

    'GREEN CANYON TIMBERLANDS LLC': 'corp',
    'GREEN CANYON TIMBERLANDS LL': 'corp',
    'BTG PACTUAL OEF PROPERTY 1': 'corp',
    'BNSF RWY PROP TAX DEPT': 'corp',
    'BNSF': 'corp',

    'MAGEE DANIEL W': 'indiv',
    'STAFFORD ALLEN': 'indiv',
}

covered = {
    'watershed': [],
    'tribe': [],
    'federal': [],
    'state': [],
    'local': [],
    'corp': [],
    'indiv': [],
    'none': [],
}

full_paths = [os.path.join(args.inparcelsdir, file) for file in os.listdir(sys.argv[1])]
partial = 0



# https://shapely.readthedocs.io/en/stable/predicates.html



for filepath in full_paths:

    print(f"Processing {filepath}...")
    with open(filepath, 'r') as f:
        parcels = json.load(f)


    print(len(parcels['features']))
    print()

    for parcel in parcels['features']:
        geom = shapely.from_geojson(json.dumps(parcel))
        if shapely.intersects(geom, gmuEastGeom):
            # completely covered, not just a partial overlap
            # if shapely.covered_by(geom, gmuEastGeom):

            # overlaps, but only partially, NOT completely
            if shapely.overlaps(geom, gmuEastGeom):
                sect = shapely.intersection(geom, gmuEastGeom)
                sectJson = shapely.geometry.mapping(sect)
                parcel['geometry'] = sectJson

            if 'owner' in parcel['properties'].keys():
                owner = parcel['properties']['owner']
                status = owner_table[owner]
            else:
                status = 'none'
            covered[status].append(parcel)

            


for status in covered.keys():
    filescheme = {
        'type': 'FeatureCollection',
        'features': covered[status]
    }
    outpath = os.path.join(args.outparcelsdir, f"{status}.geojson")
    with open(outpath, 'w') as f:
        json.dump(filescheme, f)

print()
print('done')

