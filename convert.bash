INPUT_VIDEO=$1 TYPE=$2

ffmpeg -i $INPUT_VIDEO -vf hue=s=0 BW/${INPUT_VIDEO%.*}.mov
