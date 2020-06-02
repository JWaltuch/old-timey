INPUT_VIDEO=$1 TYPE=$2

ffmpeg -i $INPUT_VIDEO -vf hue=s=0 ${INPUT_VIDEO%.*}_BW.mov
