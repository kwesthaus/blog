#!/usr/bin/env python

import sys
import os
import subprocess
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('indir', help='path to directory containing .mvt files')
parser.add_argument('outdir', help='path to directory where .geojson output will be placed')
if len(sys.argv) < 2:
    parser.print_help(sys.stderr)
    sys.exit(1)
args = parser.parse_args()


full_paths = [os.path.join(args.indir, file) for file in os.listdir(args.indir)]

for filepath in full_paths:
    if not os.path.isfile(filepath):
        continue

    print(filepath)
    (base, ext) = os.path.basename(filepath).split('.')
    if(ext != 'mvt'):
        continue

    (z, x, y) = base.split('-')

    outbase = f"{base}.geojson"
    outfname = os.path.join(args.outdir, outbase)
    cmd = ['vt2geojson', '-x', x, '-y', y, '-z', z, filepath]
    subprocess.run(cmd, stdout=open(outfname, 'w'))

print('done')

